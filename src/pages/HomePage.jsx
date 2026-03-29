import React, { useState, useEffect, useCallback, useRef } from 'react';
import DeviceCard from '../components/DeviceCard';
import DeviceInfoPage from './DeviceInfoPage';
import { getAllDevices } from '../api/deviceApi';
import { sensorWebSocket } from '../api/websocket';
import { transformDeviceData, processSensorData, calculateDeviceStatus } from '../api/helperFunctions';

import apiClient from '../api/api';

const HomePage = ({ onShowNotifications, onShowDetails }) => {

    const NODE_TIMEOUT_MS = 10000; // 10 seconds

    const [devices, setDevices] = useState([]);
    const [filteredDevices, setFilteredDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nodeRequests, setNodeRequests] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [floorFilter, setFloorFilter] = useState('');
    const [wardFilter, setWardFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const connectAttemptedRef = useRef(false);
    const [selectedMac, setSelectedMac] = useState(null);
    const [newDevice, setNewDevice] = useState({});
    const [hospitalStructure, setHospitalStructure] = useState([]);




    const [patients, setPatients] = useState([]);

    const [showPatientModal, setShowPatientModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [fluidType, setFluidType] = useState("");
    const [fluidCapacity, setFluidCapacity] = useState("");
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignResponse, setAssignResponse] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");



    const fluidTypes = [
        { value: "iv_bag", label: "IV Bag" },
        { value: "blood_bag", label: "Blood Bag" },
        { value: "urine_bag", label: "Urine Bag" },
    ];

    const loadPatients = async () => {
        try {
            const res = await apiClient.get("hospital/patients/");
            // ✅ Only include patients with floor, ward, and bed
            const admitted = res.data.filter(
                (p) => !p.discharged_at && p.floor && p.ward && p.bed
            );
            setPatients(admitted);
        } catch (err) {
            console.error("Failed to load patients:", err);
        }
    };


    const [showAddModal, setShowAddModal] = useState(false);

    const handleAddDevice = () => setShowAddModal(true);



    const handleCloseModal = () => setShowAddModal(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDevice((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("📦 Submitting new device:", newDevice);

        try {
            alert("✅ Device added successfully!");
            handleCloseModal();
            fetchDevices();
        } catch (error) {
            console.error("❌ Failed to add device:", error);
            alert("Failed to add device. Try again.");
        }
    };


    const handleAddNode = (mac) => {
        setSelectedMac(mac);
        setShowAddModal(false);   // ✅ Close the Available Node Requests modal
        setShowPatientModal(true); // ✅ Then open the Select Patient modal
        loadPatients();
    };



    const [viewMode, setViewMode] = useState(() => {
        const savedView = localStorage.getItem('deviceViewMode');
        return savedView || 'card';
    });

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

    const handleConnectionStatus = useCallback((data) => {
        console.log("Received connection status from WebSocket:", data);
        setConnectionStatus(data.status);

        if (data.status === 'failed') {
            setError(data.message || 'Connection to server failed');
        } else if (data.status === 'connected') {
            setError(null);
        }
    }, []);

    const handleSensorData = useCallback((data) => {
        console.log('🔵 Received sensor data from WebSocket:', data);

        // Process the raw sensor data using helper function
        const processedData = processSensorData(data.message || data || {});

        console.log('🟢 Processed sensor data:', processedData);
        console.log('🔍 Looking for device with nodeId:', processedData.nodeId);

        setDevices(prevDevices => {
            const updatedDevices = prevDevices.map(device => {
                // ✅ CRITICAL: Match by nodeId (UUID) not mac address
                console.log(`Comparing device.nodeId: ${device.nodeId} with incoming: ${processedData.nodeId}`);

                if (device.nodeId === processedData.nodeId) {
                    console.log(`✅ MATCH FOUND! Updating device ${device.id}`);
                    console.log(`   - Current level: ${device.level} → New level: ${processedData.reading}`);
                    console.log(`   - Current status: ${device.status} → New status: ${processedData.status}`);
                    console.log(`   - Current battery: ${device.batteryPercent} → New battery: ${processedData.batteryPercent}`);

                    const updatedDevice = {
                        ...device,
                        level: Math.round(processedData.reading), // ✅ Update level
                        lastReading: processedData.timestamp, // ✅ Update timestamp
                        status: processedData.status || device.status, // ✅ Update status
                        batteryPercent: processedData.batteryPercent // ✅ Update battery
                    };

                    // Calculate alert status based on thresholds
                    if (updatedDevice.fluidBag) {
                        const alertStatus = calculateDeviceStatus(
                            updatedDevice.level,
                            updatedDevice.fluidBag
                        );
                        updatedDevice.alertStatus = alertStatus;
                    }

                    console.log('📦 Updated device:', updatedDevice);
                    return updatedDevice;
                }
                return device;
            });

            // ✅ Log if no match was found
            const matchFound = updatedDevices.some(d => d.nodeId === processedData.nodeId);
            if (!matchFound) {
                console.warn(`⚠️ No device found with nodeId: ${processedData.nodeId}`);
                console.log('Available devices:', prevDevices.map(d => ({ id: d.id, nodeId: d.nodeId })));
            }

            return updatedDevices;
        });
    }, []);

    useEffect(() => {
        if (showConfirmModal) {
            apiClient.get("hospital/")
                .then(res => setHospitalStructure(res.data))
                .catch(err => console.error("Failed to load structure:", err));
        }
    }, [showConfirmModal]);

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

    useEffect(() => {
        console.log("HomePage useEffect running");

        fetchDevices();

        sensorWebSocket.on('connection', handleConnectionStatus);
        sensorWebSocket.on('sensor_data', handleSensorData);

        // 🆕 Handle incoming Node-ID requests
        const handleNodeIdRequest = (data) => {
            const mac = data.mac;
            if (!mac) return;
            console.log("📩 Node requesting ID (ws):", mac);

            setNodeRequests(prev => {
                const now = Date.now();
                // if already exists, update its timestamp
                const idx = prev.findIndex(item => item.mac === mac);
                if (idx !== -1) {
                    const copy = [...prev];
                    copy[idx] = { mac, receivedAt: now };
                    return copy;
                }
                // new entry
                return [...prev, { mac, receivedAt: now }];
            });
        };

        sensorWebSocket.on('node_id_request', handleNodeIdRequest);

        if (!connectAttemptedRef.current) {
            console.log("Connecting WebSocket from HomePage useEffect");
            sensorWebSocket.connect();
            connectAttemptedRef.current = true;
        }

        return () => {
            console.log("HomePage useEffect cleanup running");
            sensorWebSocket.off('connection', handleConnectionStatus);
            sensorWebSocket.off('sensor_data', handleSensorData);
            sensorWebSocket.off('node_id_request', handleNodeIdRequest);
            sensorWebSocket.disconnect();
            connectAttemptedRef.current = false;
        };
    }, [fetchDevices, handleConnectionStatus, handleSensorData]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setNodeRequests(prev => {
                // keep only those with recent timestamps
                const kept = prev.filter(item => (now - item.receivedAt) <= NODE_TIMEOUT_MS);
                // only update state when something changed to avoid unnecessary renders
                if (kept.length === prev.length) return prev;
                return kept;
            });
        }, 1000); // check every 1s (adjust if you want)

        return () => clearInterval(interval);
    }, []);


    useEffect(() => {
        localStorage.setItem('deviceViewMode', viewMode);
    }, [viewMode]);

    const handleShowDetails = (device) => {
        setSelectedDevice(device);
        if (onShowDetails) {
            onShowDetails(device);
        }
    };

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
    }, []);

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


    const uniqueFloors = [...new Set(devices.map(d => d.current_ward_number).filter(n => n != null))];
    const uniqueWards = [...new Set(devices.map(d => d.current_ward_name).filter(n => n != null))];

    return (
        <div className="p-8">
            {/* 🧑‍⚕️ Patient Selection Modal */}
            {showPatientModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 className="text-xl font-semibold text-blue-700">Select Patient</h2>
                            <button
                                onClick={() => setShowPatientModal(false)}
                                className="text-gray-500 hover:text-red-600 font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by patient name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 mb-4 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {patients
                                        .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map((p) => (
                                            <tr key={p.id}>
                                                <td className="px-4 py-2 text-sm text-gray-800">{p.name}</td>
                                                <td className="px-4 py-2 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPatient(p);
                                                            setShowConfirmModal(true);
                                                        }}

                                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                                    >
                                                        Assign Device
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmModal && selectedPatient && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[60]">
                    <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6">

                        {/* Loader Overlay */}
                        {isAssigning && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20 rounded-xl">
                                <div className="flex flex-col items-center">
                                    <svg className="animate-spin h-10 w-10 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                    </svg>
                                    <p className="text-sm font-medium text-blue-700">Assigning device...</p>
                                </div>
                            </div>
                        )}

                        {/* Header */}
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Assignment</h2>

                        {/* Patient Info */}
                        <div className="space-y-2 text-sm text-gray-700">
                            <p><strong>Patient:</strong> {selectedPatient.name}</p>
                            <p><strong>MAC:</strong> {selectedMac}</p>
                        </div>

                        {/* Location */}
                        <div className="mt-4 space-y-3 text-sm text-gray-700">
                            <p><strong>Floor:</strong> {selectedPatient.floor}</p>
                            <p><strong>Ward:</strong> {selectedPatient.ward}</p>
                            <p><strong>Bed:</strong> {selectedPatient.bed}</p>
                        </div>

                        {/* Info text */}
                        {selectedPatient.floor && selectedPatient.ward && selectedPatient.bed && (
                            <p className="text-xs text-gray-500 mt-2 italic">
                                To update location, go to the <span className="font-semibold text-blue-700">Patient List</span> tab.
                            </p>
                        )}

                        {/* ✅ MOVE THESE INSIDE THE SAME DIV */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fluid Type</label>
                            <select
                                required
                                value={fluidType}
                                onChange={(e) => setFluidType(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Fluid Type</option>
                                <option value="iv_bag">IV Bag</option>
                                <option value="blood_bag">Blood Bag</option>
                                <option value="urine_bag">Urine Bag</option>
                            </select>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fluid Capacity</label>
                            <select
                                required
                                value={fluidCapacity}
                                onChange={(e) => setFluidCapacity(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Capacity</option>
                                <option value="100">100 ml</option>
                                <option value="200">200 ml</option>
                                <option value="500">500 ml</option>
                                <option value="1000">1000 ml</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setAssignResponse(null);
                                }}
                                disabled={isAssigning}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={!fluidType || !fluidCapacity || isAssigning}
                                onClick={async () => {
                                    setIsAssigning(true);
                                    try {
                                        const response = await apiClient.post("sensor/devices/register/", {
                                            mac: selectedMac,
                                            patient_id: selectedPatient.id,
                                            bed: selectedPatient.bed,
                                            fluid_type: fluidType,
                                            fluid_capacity: fluidCapacity,
                                        });


                                        setShowConfirmModal(false);
                                        setShowPatientModal(false);
                                        setShowAddModal(false);
                                        setFluidType("");
                                        setFluidCapacity("");
                                        setSelectedPatient(null);
                                        setSuccessData(response.data);
                                        setShowSuccessModal(true);

                                        setTimeout(() => {
                                            setShowSuccessModal(false);
                                            setSuccessData(null);
                                            fetchDevices();
                                        }, 10000);
                                    } catch (err) {
                                        console.error("❌ Assignment failed:", err);
                                        alert("Assignment failed. Try again.");
                                    } finally {
                                        setIsAssigning(false);
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center min-w-[100px]"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}






            {
                showAddModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative border border-blue-100">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-5 border-b pb-3">
                                <h2 className="text-2xl font-semibold text-blue-700">Available Node Requests</h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-500 hover:text-red-500 transition-colors text-xl font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Body */}
                            {nodeRequests.length === 0 ? (
                                <p className="text-gray-500 text-center py-10">No pending node requests.</p>
                            ) : (
                                <div className="max-h-60 overflow-y-auto rounded-xl border border-blue-100 shadow-inner mb-6">
                                    <table className="min-w-full divide-y divide-blue-100">
                                        <thead className="bg-blue-50 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                                                    MAC Address
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-blue-100">
                                            {nodeRequests.map((item, i) => (
                                                <tr key={`${item.mac}-${item.receivedAt}-${i}`} className="hover:bg-blue-50 transition-colors">
                                                    <td className="px-4 py-2 text-sm text-gray-700 font-mono">{item.mac}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">Node</td>
                                                    <td className="px-4 py-2 text-right">
                                                        <button
                                                            onClick={() => handleAddNode(item.mac)}
                                                            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-transform"
                                                        >
                                                            Add
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* 🔽 Inline Patient Selection Section */}
                            {showPatientModal && (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4 shadow-inner">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-lg font-semibold text-blue-800">
                                            Select Patient for <span className="font-mono text-gray-700">{selectedMac}</span>
                                        </h3>
                                        <button
                                            onClick={() => setShowPatientModal(false)}
                                            className="text-sm text-gray-500 hover:text-red-600 font-medium"
                                        >
                                            Close
                                        </button>
                                    </div>

                                    {/* Search Bar */}
                                    <input
                                        type="text"
                                        placeholder="Search by patient name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2 mb-3 text-sm focus:ring-2 focus:ring-blue-500"
                                    />

                                    {/* Patient Table */}
                                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {patients
                                                    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                                    .map((p) => (
                                                        <tr key={p.id}>
                                                            <td className="px-4 py-2 text-sm text-gray-800">{p.name}</td>
                                                            <td className="px-4 py-2 text-right">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedPatient(p);
                                                                        setShowConfirmModal(true);
                                                                    }}
                                                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                                                >
                                                                    Assign Device
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}




                            {/* Footer */}
                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:scale-95 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }


            {
                showErrorModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[70]">
                        <div className="bg-red-50 rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-red-200">
                            <button
                                onClick={() => setShowErrorModal(false)}
                                className="absolute top-3 right-3 text-red-500 hover:text-red-700 font-bold text-lg"
                            >
                                ✕
                            </button>
                            <div className="text-center">
                                <h2 className="text-xl font-bold text-red-800 mb-3">❌ Assignment Failed</h2>
                                <p className="text-sm text-gray-700">{errorMessage}</p>
                                <p className="text-xs text-gray-500 mt-4">Please check the details and try again.</p>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showSuccessModal && successData && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[70]">
                        <div className="bg-green-50 rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-green-200 transition-opacity duration-700 ease-in-out">
                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    setSuccessData(null);
                                }}
                                className="absolute top-3 right-3 text-red-500 hover:text-red-700 font-bold text-lg"
                            >
                                ✕
                            </button>

                            <div className="text-center">
                                <h2 className="text-xl font-bold text-green-800 mb-3">✅ Device Assigned Successfully</h2>

                                {/* ✅ Safely show Node ID */}
                                {successData?.node_id && (
                                    <p className="text-sm text-gray-700 mb-2">
                                        <strong>Node ID:</strong>{" "}
                                        <span className="font-mono text-gray-900">{successData.node_id}</span>
                                    </p>
                                )}

                                {/* ✅ Safely show Patient */}
                                {successData?.patient && (
                                    <p className="text-sm text-gray-700">
                                        <strong>Patient:</strong> {successData.patient}
                                    </p>
                                )}

                                {/* ✅ Optional message */}
                                {successData?.message && (
                                    <p className="text-xs text-gray-600 mt-3 italic">{successData.message}</p>
                                )}

                                <p className="text-xs text-gray-500 mt-4">This message will close automatically in 10 seconds.</p>
                            </div>
                        </div>
                    </div>
                )
            }


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
                    <button
                        onClick={handleAddDevice}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Add Devices
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

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
            {
                error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-800 font-medium">{error}</span>
                        </div>
                    </div>
                )
            }

            {/* Loading State */}
            {
                loading && devices.length === 0 ? (
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
                )
            }
        </div >
    );
};

export default HomePage;

