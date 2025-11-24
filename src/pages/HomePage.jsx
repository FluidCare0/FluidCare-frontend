import React, { useState, useEffect, useCallback, useRef } from 'react';
import DeviceCard from '../components/DeviceCard';
import DeviceInfoPage from './DeviceInfoPage';
import { getAllDevices } from '../api/deviceApi';
import { sensorWebSocket } from '../api/websocket';
import { transformDeviceData, processSensorData, calculateDeviceStatus } from '../api/helperFunctions';

// --- ADD API FUNCTION FOR DISCONNECT ---
import apiClient from '../api/api'; // Import the main apiClient instance

const HomePage = ({ onShowNotifications, onShowDetails }) => {
    const [devices, setDevices] = useState([]);
    const [filteredDevices, setFilteredDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    // State to manage view mode
    const [viewMode, setViewMode] = useState(() => {
        // Initialize from localStorage or default to 'card'
        const savedView = localStorage.getItem('deviceViewMode');
        return savedView || 'card';
    });

    // State for filters
    const [floorFilter, setFloorFilter] = useState('');
    const [wardFilter, setWardFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState(''); // Optional: filter by status

    // Ref to track if connect has been attempted in this component's lifecycle
    const connectAttemptedRef = useRef(false);

    // Fetch initial devices data
    const fetchDevices = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllDevices();
            // Transform backend data using helper function
            const transformedDevices = data.map(transformDeviceData);
            setDevices(transformedDevices);
        } catch (err) {
            console.error('Error fetching devices:', err);
            setError('Failed to load devices. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Handle WebSocket connection status
    const handleConnectionStatus = useCallback((data) => {
        console.log("Received connection status from WebSocket:", data);
        setConnectionStatus(data.status);

        if (data.status === 'failed') {
            setError(data.message || 'Connection to server failed');
        } else if (data.status === 'connected') {
            setError(null);
        }
    }, []);

    // Handle incoming sensor data from WebSocket
    const handleSensorData = useCallback((data) => {
        console.log('🔵 Received sensor data from WebSocket:', data);

        // Process the raw sensor data using helper function
        // This extracts all fields including status (if present in the message)
        const processedData = processSensorData(data.message); // Assuming data.message contains the payload

        console.log('🟢 Processed sensor data:', processedData);

        setDevices(prevDevices =>
            prevDevices.map(device => {
                // Match device by nodeId (from WebSocket message)
                if (device.id === processedData.nodeId) {
                    console.log(`✅ Updating device ${device.id} with status: ${processedData.status}, level: ${processedData.reading}`);

                    const updatedDevice = {
                        ...device,
                        level: Math.round(processedData.reading),
                        lastReading: processedData.timestamp,
                        // ✅ Update status from WebSocket message if present
                        status: processedData.status || device.status, // Use new status or keep old one if not provided
                        batteryPercent: processedData.batteryPercent
                    };

                    // Calculate alert status based on thresholds
                    if (updatedDevice.fluidBag) {
                        const alertStatus = calculateDeviceStatus(
                            updatedDevice.level,
                            updatedDevice.fluidBag
                        );
                        updatedDevice.alertStatus = alertStatus;
                    }

                    return updatedDevice;
                }
                return device;
            })
        );
    }, []);

    // Apply filters whenever devices, or filter states change
    useEffect(() => {
        let result = devices;

        if (floorFilter) {
            result = result.filter(device => device.current_ward_number && device.current_ward_number.toString() === floorFilter);
        }
        if (wardFilter) {
            result = result.filter(device => device.current_ward_name && device.current_ward_name.toLowerCase().includes(wardFilter.toLowerCase()));
        }
        if (statusFilter) {
            result = result.filter(device => device.status && device.status.toLowerCase().includes(statusFilter.toLowerCase()));
        }

        setFilteredDevices(result);
    }, [devices, floorFilter, wardFilter, statusFilter]);

    // Initialize WebSocket and fetch devices
    useEffect(() => {
        console.log("HomePage useEffect running");

        // Fetch initial devices
        fetchDevices();

        // Setup WebSocket listeners
        sensorWebSocket.on('connection', handleConnectionStatus);
        sensorWebSocket.on('sensor_data', handleSensorData);

        // Use a ref to ensure connect is only attempted once per component mount
        if (!connectAttemptedRef.current) {
            console.log("Connecting WebSocket from HomePage useEffect");
            sensorWebSocket.connect();
            connectAttemptedRef.current = true;
        } else {
            console.log("WebSocket connect already attempted for this mount, skipping.");
        }

        // Cleanup
        return () => {
            console.log("HomePage useEffect cleanup running");
            sensorWebSocket.off('connection', handleConnectionStatus);
            sensorWebSocket.off('sensor_data', handleSensorData);
            sensorWebSocket.disconnect();
            connectAttemptedRef.current = false;
        };
    }, [fetchDevices, handleConnectionStatus, handleSensorData]);

    // Update localStorage when viewMode changes
    useEffect(() => {
        localStorage.setItem('deviceViewMode', viewMode);
    }, [viewMode]);

    const handleShowDetails = (device) => {
        setSelectedDevice(device);
        if (onShowDetails) {
            onShowDetails(device);
        }
    };

    // --- UPDATE handleDisconnect TO PERFORM API CALL ---
    const handleDisconnect = useCallback(async (device) => {
        try {
            // Example API call - adjust the endpoint and method as needed for your backend
            // This assumes there's an endpoint like /api/devices/{id}/disconnect/
            const response = await apiClient.post(`/sensor/devices/${device.id}/disconnect/`);

            // Return the response object so the DeviceCard can check the status
            return response; // e.g., { status: 200, data: ... }

        } catch (err) {
            console.error("API call to disconnect device failed:", err);
            // Throw the error so the DeviceCard's catch block can handle it
            throw err;
        }
    }, []); // Empty dependency array if apiClient and endpoint are static
    // If the endpoint needs device-specific details from the HomePage's scope, add them to the dependency array.

    const handleBackToHome = () => {
        setSelectedDevice(null);
    };

    const handleRefresh = () => {
        fetchDevices();
    };

    // Function to toggle view mode
    const toggleViewMode = () => {
        setViewMode(prevMode => prevMode === 'card' ? 'list' : 'card');
    };

    // Function to clear all filters
    const clearFilters = () => {
        setFloorFilter('');
        setWardFilter('');
        setStatusFilter('');
    };

    if (selectedDevice) {
        return <DeviceInfoPage device={selectedDevice} onBack={handleBackToHome} />;
    }

    // Extract unique floors and wards from the original device list for filter options
    const uniqueFloors = [...new Set(devices.map(d => d.current_ward_number).filter(n => n != null))];
    const uniqueWards = [...new Set(devices.map(d => d.current_ward_name).filter(n => n != null))];

    return (
        <div className="p-8">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Active Devices</h2>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${connectionStatus === 'connected'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            <span className={`w-2 h-2 rounded-full mr-2 ${connectionStatus === 'connected'
                                ? 'bg-green-500'
                                : 'bg-red-500'
                                }`}></span>
                            {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                        </span>
                        <span className="text-sm text-gray-600">
                            {filteredDevices.length} of {devices.length} devices shown
                        </span>
                    </div>
                </div>

                <div className="flex gap-3">
                    {/* View Toggle Button */}
                    <button
                        onClick={toggleViewMode}
                        className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors shadow-sm"
                        aria-label={`Switch to ${viewMode === 'card' ? 'List' : 'Card'} View`}
                    >
                        {viewMode === 'card' ? 'List View' : 'Card View'}
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors shadow-sm"
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm">
                        Add Devices
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="floorFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Floor</label>
                        <select
                            id="floorFilter"
                            value={floorFilter}
                            onChange={(e) => setFloorFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Floors</option>
                            {uniqueFloors.map(floor => (
                                <option key={`floor-${floor}`} value={floor}>{floor}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="wardFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Ward</label>
                        <select
                            id="wardFilter"
                            value={wardFilter}
                            onChange={(e) => setWardFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Wards</option>
                            {uniqueWards.map(ward => (
                                <option key={`ward-${ward}`} value={ward}>{ward}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors shadow-sm font-medium"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red-800 font-medium">{error}</span>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && devices.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading devices...</p>
                    </div>
                </div>
            ) : filteredDevices.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No devices found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or add a new device.</p>
                </div>
            ) : (
                /* Conditional Rendering based on viewMode */
                viewMode === 'card' ? (
                    /* Devices Grid - Card View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDevices.map((device) => (
                            <DeviceCard
                                key={device.id}
                                device={device}
                                onShowDetails={handleShowDetails}
                                // Pass the updated handleDisconnect function
                                onDisconnect={handleDisconnect}
                            />
                        ))}
                    </div>
                ) : (
                    /* Devices Table - List View */
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Reading</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battery</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ward</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDevices.map((device) => (
                                    <tr key={device.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{device.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{device.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${device.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    device.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                                        device.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {device.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {device.level}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.lastReading}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.batteryPercent}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.current_ward_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.current_ward_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleShowDetails(device)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleDisconnect(device)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Disconnect
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
};

export default HomePage;