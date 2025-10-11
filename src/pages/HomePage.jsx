import React, { useState, useEffect, useCallback } from 'react';
import DeviceCard from '../components/DeviceCard';
import DeviceInfoPage from './DeviceInfoPage';
import {
    getAllDevices,
    sensorWebSocket,
    transformDeviceData,
    processSensorData,
    calculateDeviceStatus
} from '../api/api';

const HomePage = ({ onShowNotifications, onShowDetails }) => {
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    // Fetch initial devices data
    const fetchDevices = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllDevices();
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
        setConnectionStatus(data.status);

        if (data.status === 'failed') {
            setError(data.message || 'Connection to server failed');
        } else if (data.status === 'connected') {
            setError(null);
        }
    }, []);

    // Handle incoming sensor data from WebSocket
    const handleSensorData = useCallback((data) => {
        console.log('Received sensor data:', data);

        const processedData = processSensorData(data);

        setDevices(prevDevices =>
            prevDevices.map(device => {
                // Match device by node_id or mac_address
                if (device.id === processedData.nodeId ||
                    device.deviceId === processedData.nodeMac) {

                    const updatedDevice = {
                        ...device,
                        level: Math.round(processedData.reading),
                        lastReading: processedData.timestamp,
                        status: 'Activate', // Device is active if sending data
                        batteryPercent: processedData.batteryPercent
                    };

                    // Calculate alert status based on thresholds
                    if (device.fluidBag) {
                        const alertStatus = calculateDeviceStatus(
                            processedData.reading,
                            device.fluidBag
                        );
                        updatedDevice.alertStatus = alertStatus;
                    }

                    return updatedDevice;
                }
                return device;
            })
        );
    }, []);

    // Initialize WebSocket and fetch devices
    useEffect(() => {
        // Fetch initial devices
        fetchDevices();

        // Setup WebSocket
        sensorWebSocket.on('connection', handleConnectionStatus);
        sensorWebSocket.on('sensor_data', handleSensorData);

        // Connect to WebSocket
        sensorWebSocket.connect();

        // Cleanup
        return () => {
            sensorWebSocket.off('connection', handleConnectionStatus);
            sensorWebSocket.off('sensor_data', handleSensorData);
        };
    }, [fetchDevices, handleConnectionStatus, handleSensorData]);

    const handleShowDetails = (device) => {
        setSelectedDevice(device);
        if (onShowDetails) {
            onShowDetails(device);
        }
    };

    const handleDisconnect = (device) => {
        // Update device status to offline
        setDevices(prevDevices =>
            prevDevices.map(d =>
                d.id === device.id ? { ...d, status: 'Offline' } : d
            )
        );
    };

    const handleBackToHome = () => {
        setSelectedDevice(null);
    };

    const handleRefresh = () => {
        fetchDevices();
    };

    if (selectedDevice) {
        return <DeviceInfoPage device={selectedDevice} onBack={handleBackToHome} />;
    }

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
                            {devices.length} devices found
                        </span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleRefresh}
                        className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors shadow-sm"
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                        Add Devices
                    </button>
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
            ) : devices.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No devices found</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new device.</p>
                </div>
            ) : (
                /* Devices Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devices.map((device) => (
                        <DeviceCard
                            key={device.id}
                            device={device}
                            onShowDetails={handleShowDetails}
                            onDisconnect={handleDisconnect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HomePage;