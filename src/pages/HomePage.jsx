import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DeviceCard from '../components/DeviceCard';
import Card from '../components/Card';
import { getAllDevices } from '../api/deviceApi';
import { transformDeviceData, processSensorData, calculateDeviceStatus } from '../api/helperFunctions';
import WebSocketStatus from '../components/WebSocketStatus';
import { useSensorWebSocket } from '../hooks/useSensorWebSocket';
import apiClient from '../api/api';

const HomePage = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('deviceViewMode') || 'card';
    });
    const [wardFilter, setWardFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedDevice, setSelectedDevice] = useState(null);

    // Node request states
    const [nodeRequests, setNodeRequests] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);

    // Patient assignment states
    const [selectedMac, setSelectedMac] = useState(null);
    const [patients, setPatients] = useState([]);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [fluidType, setFluidType] = useState('');
    const [fluidCapacity, setFluidCapacity] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Hospital structure states
    const [hospitalData, setHospitalData] = useState([]);
    const [selectedFloorId, setSelectedFloorId] = useState('');
    const [selectedWardId, setSelectedWardId] = useState('');
    const [selectedBedId, setSelectedBedId] = useState('');

    // ================= NODE REQUEST HANDLER =================
    const handleNodeRequest = useCallback((data) => {
        const mac = data.mac;
        if (!mac) return;
        setNodeRequests(prev => {
            const now = Date.now();
            const existing = prev.find(item => item.mac === mac);
            if (existing) {
                return prev.map(item =>
                    item.mac === mac ? { mac, receivedAt: now } : item
                );
            }
            return [...prev, { mac, receivedAt: now }];
        });
    }, []);

    // ================= LOAD PATIENTS =================
    const loadPatients = async () => {
        try {
            const res = await apiClient.get("hospital/patients/");
            const admitted = res.data.filter((p) => !p.discharged_at);
            setPatients(admitted);
        } catch (err) {
            console.error("Failed to load patients:", err);
        }
    };

    // ================= FETCH HOSPITAL STRUCTURE =================
    const fetchHospitalData = async () => {
        try {
            const res = await apiClient.get("hospital/");
            setHospitalData(res.data);
        } catch (err) {
            console.error("Failed to load hospital structure:", err);
        }
    };

    // ================= FETCH DEVICES =================
    const fetchDevices = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await getAllDevices();
            const normalized = Array.isArray(response) ? response : [];
            setDevices(normalized.map(transformDeviceData));
        } catch (err) {
            console.error('Failed to load devices:', err);
            setError('Failed to load devices.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    useEffect(() => {
        localStorage.setItem('deviceViewMode', viewMode);
    }, [viewMode]);

    // ================= SENSOR DATA HANDLER =================
    // ================= SENSOR DATA HANDLER =================
    const handleSensorData = useCallback((data) => {
        // ★ FIXED: Safe extraction of payload
        // Prevents the `{} || data` bug where an empty object bypasses the fallback
        const payload = (data?.message && typeof data.message === 'object' && Object.keys(data.message).length > 0)
            ? data.message
            : data;

        const processed = processSensorData(payload);

        if (!processed || !processed.nodeId) {
            console.warn("⚠️ Invalid or empty sensor data received:", data);
            return;
        }

        setDevices((prev) =>
            prev.map((device) => {
                if (device.nodeId !== processed.nodeId) return device;

                const updated = {
                    ...device,
                    level: Math.round(processed.reading),
                    smoothedWeight: processed.smoothedWeight,
                    lastReading: processed.timestamp,
                    status: processed.status || device.status,
                    batteryPercent: processed.batteryPercent,
                };

                if (updated.fluidBag) {
                    updated.alertStatus = calculateDeviceStatus(
                        updated.smoothedWeight ?? updated.level,
                        updated.fluidBag
                    );
                }

                return updated;
            })
        );
    }, []);
    
    // =====================================================
    // ★ NEW: Handle refresh_devices from WebSocket ★
    // =====================================================
    const handleDevicesRefresh = useCallback((data) => {
        console.log('🔄 refresh_devices event received:', data);
        fetchDevices();
        setShowSuccess(false);
    }, []);

    useSensorWebSocket({
        onSensorData: handleSensorData,
        onNodeRequest: handleNodeRequest,
        onDevicesRefresh: handleDevicesRefresh,  // ★ NEW
    });

    // ================= CLEANUP NODE REQUESTS =================
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setNodeRequests(prev =>
                prev.filter(item => now - item.receivedAt <= 10000)
            );
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // ================= CASCADING DROPDOWN LOGIC =================
    const availableWards = useMemo(() => {
        if (!selectedFloorId) return [];
        const floor = hospitalData.find(f => f.id === Number(selectedFloorId));
        return floor ? floor.wards : [];
    }, [selectedFloorId, hospitalData]);

    const availableBeds = useMemo(() => {
        if (!selectedWardId) return [];
        const ward = availableWards.find(w => w.id === Number(selectedWardId));
        if (!ward) return [];
        const currentPatientBedId = (selectedPatient?.floor && selectedPatient?.ward && selectedPatient?.bed)
            ? ward.beds.find(b => b.bed_number === selectedPatient.bed)?.id
            : null;
        return ward.beds.filter(b => !b.is_occupied || b.id === currentPatientBedId);
    }, [selectedWardId, availableWards, selectedPatient]);

    // ================= HANDLE ASSIGN DEVICE =================
    const handleAssign = async () => {
        setIsAssigning(true);
        try {
            await apiClient.post("sensor/devices/register/", {
                mac: selectedMac,
                patient_id: selectedPatient.id,
                bed_id: Number(selectedBedId),
                fluid_type: fluidType,
                fluid_capacity: fluidCapacity,
            });

            // Reset all modal states
            setSelectedPatient(null);
            setShowPatientModal(false);
            setSelectedMac(null);
            setFluidType('');
            setFluidCapacity('');
            setSelectedFloorId('');
            setSelectedWardId('');
            setSelectedBedId('');
            setShowAddModal(false);

            // Remove the assigned node from requests
            setNodeRequests(prev => prev.filter(n => n.mac !== selectedMac));

            // Show success — will be auto-dismissed when refresh_devices arrives
            setShowSuccess(true);

        } catch (err) {
            console.error("Assignment failed:", err);
            alert("Failed to assign device");
        } finally {
            setIsAssigning(false);
        }
    };

    // ================= HANDLERS =================
    const handleSelectNode = (mac) => {
        setSelectedMac(mac);
        setShowAddModal(false);
        setShowPatientModal(true);
        loadPatients();
        fetchHospitalData();
    };

    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        if (patient.floor && patient.ward && patient.bed) {
            const floorMatch = hospitalData.find(f => f.name === patient.floor);
            if (floorMatch) {
                setSelectedFloorId(String(floorMatch.id));
                const wardMatch = floorMatch.wards.find(w => w.name === patient.ward);
                if (wardMatch) {
                    setSelectedWardId(String(wardMatch.id));
                    const bedMatch = wardMatch.beds.find(b => b.bed_number === patient.bed);
                    setSelectedBedId(bedMatch ? String(bedMatch.id) : '');
                } else {
                    setSelectedWardId('');
                    setSelectedBedId('');
                }
            } else {
                setSelectedFloorId('');
                setSelectedWardId('');
                setSelectedBedId('');
            }
        } else {
            setSelectedFloorId('');
            setSelectedWardId('');
            setSelectedBedId('');
        }
    };

    const handleCancelAssignment = () => {
        setSelectedPatient(null);
        setSelectedFloorId('');
        setSelectedWardId('');
        setSelectedBedId('');
    };

    const handleClosePatientModal = () => {
        setShowPatientModal(false);
        setSelectedMac(null);
    };

    const isFormValid = fluidType && fluidCapacity && selectedBedId;

    // ================= COMPUTED VALUES =================
    const uniqueWards = useMemo(() => {
        return [...new Set(devices.map((device) => device.ward).filter(Boolean))];
    }, [devices]);

    const uniqueStatuses = useMemo(() => {
        return [...new Set(devices.map((device) => device.status).filter(Boolean))];
    }, [devices]);

    const filteredDevices = useMemo(() => {
        return devices.filter((device) => {
            const wardMatches = !wardFilter || device.ward === wardFilter;
            const statusMatches = !statusFilter || device.status === statusFilter;
            return wardMatches && statusMatches;
        });
    }, [devices, statusFilter, wardFilter]);

    // ================= RENDER =================
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            {/* HEADER */}
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Active Devices</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Showing {filteredDevices.length} of {devices.length} devices
                    </p>
                </div>
                <div className="flex items-center flex-wrap gap-3">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 rounded"
                    >
                        Add Device
                    </button>
                    <WebSocketStatus label="Device Sync" />
                    <button
                        onClick={() => setViewMode((current) => (current === 'card' ? 'list' : 'card'))}
                        className="bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 rounded"
                    >
                        {viewMode === 'card' ? 'List View' : 'Card View'}
                    </button>
                    <button
                        onClick={fetchDevices}
                        className="bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 rounded"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* FILTERS */}
            <Card className="mb-6 p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Ward</label>
                        <select value={wardFilter} onChange={(event) => setWardFilter(event.target.value)} className="w-full border border-gray-300 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded">
                            <option value="">All Wards</option>
                            {uniqueWards.map((ward) => (<option key={ward} value={ward}>{ward}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Status</label>
                        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full border border-gray-300 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded">
                            <option value="">All Status</option>
                            {uniqueStatuses.map((status) => (<option key={status} value={status}>{status}</option>))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button onClick={() => { setWardFilter(''); setStatusFilter(''); }} className="w-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 rounded">Clear Filters</button>
                    </div>
                </div>
            </Card>

            {error && (<div className="mb-6 border border-red-300 bg-red-50 px-4 py-3 text-red-700 rounded">{error}</div>)}

            {loading ? (
                <div className="flex h-64 items-center justify-center"><div className="text-lg text-gray-600">Loading devices...</div></div>
            ) : filteredDevices.length === 0 ? (
                <Card className="p-10 text-center">
                    <h3 className="text-lg font-semibold text-gray-800">No devices found</h3>
                    <p className="mt-2 text-sm text-gray-500">Try changing the filters or refresh the data.</p>
                </Card>
            ) : viewMode === 'card' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredDevices.map((device) => (<DeviceCard key={device.id} device={device} onShowDetails={() => setSelectedDevice(device)} />))}
                </div>
            ) : (
                <Card className="overflow-x-auto p-0">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Device</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ward</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Level</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredDevices.map((device) => (
                                <tr key={device.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{device.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{device.patient || 'No Patient'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{device.ward}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{device.level}%</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{device.status}</td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        <button onClick={() => setSelectedDevice(device)} className="text-blue-600 hover:text-blue-800">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {/* DEVICE DETAILS MODAL */}
            {selectedDevice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl rounded-xl">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">Device Details</h3>
                                <p className="mt-1 text-sm text-gray-500">Live snapshot for device #{selectedDevice.id}</p>
                            </div>
                            <button onClick={() => setSelectedDevice(null)} className="text-2xl text-gray-400 hover:text-gray-600">×</button>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Card className="p-4"><p className="text-sm text-gray-500">Patient</p><p className="mt-1 text-lg font-semibold text-gray-900">{selectedDevice.patient || 'No Patient'}</p></Card>
                            <Card className="p-4"><p className="text-sm text-gray-500">Ward</p><p className="mt-1 text-lg font-semibold text-gray-900">{selectedDevice.ward || 'N/A'}</p></Card>
                            <Card className="p-4"><p className="text-sm text-gray-500">Bed</p><p className="mt-1 text-lg font-semibold text-gray-900">{selectedDevice.bed || 'N/A'}</p></Card>
                            <Card className="p-4"><p className="text-sm text-gray-500">Status</p><p className="mt-1 text-lg font-semibold text-gray-900">{selectedDevice.status || 'Unknown'}</p></Card>
                            <Card className="p-4"><p className="text-sm text-gray-500">Fluid Level (raw)</p><p className="mt-1 text-lg font-semibold text-gray-900">{selectedDevice.level ?? 0}%</p></Card>
                            <Card className="p-4"><p className="text-sm text-gray-500">Smoothed Weight</p><p className="mt-1 text-lg font-semibold text-blue-700">{selectedDevice.smoothedWeight != null ? `${selectedDevice.smoothedWeight.toFixed(1)} g` : 'N/A'}</p></Card>
                            <Card className="p-4"><p className="text-sm text-gray-500">Battery</p><p className="mt-1 text-lg font-semibold text-gray-900">{selectedDevice.batteryPercent ?? 'N/A'}{selectedDevice.batteryPercent != null ? '%' : ''}</p></Card>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD DEVICE MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">Available Nodes</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">×</button>
                        </div>
                        {nodeRequests.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-gray-500">No available nodes detected.</p>
                                <p className="mt-2 text-sm text-gray-400">Make sure the device is powered on and in pairing mode.</p>
                            </div>
                        ) : (
                            <div className="max-h-80 overflow-y-auto space-y-2">
                                {nodeRequests.map((node) => (
                                    <div key={node.mac} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                                        <div>
                                            <p className="font-mono text-sm font-medium text-gray-900">{node.mac}</p>
                                            <p className="text-xs text-gray-500">Detected just now</p>
                                        </div>
                                        <button onClick={() => handleSelectNode(node.mac)} className="bg-blue-600 px-3 py-1.5 text-sm font-medium text-white rounded hover:bg-blue-700 transition-colors">Add</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button onClick={() => setShowAddModal(false)} className="mt-4 w-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors">Close</button>
                    </div>
                </div>
            )}

            {/* PATIENT SELECTION MODAL */}
            {showPatientModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Select Patient</h2>
                                <p className="text-sm text-gray-500 mt-1">For device: <span className="font-mono">{selectedMac}</span></p>
                            </div>
                            <button onClick={handleClosePatientModal} className="text-2xl text-gray-400 hover:text-gray-600">×</button>
                        </div>
                        {patients.length === 0 ? (
                            <div className="py-8 text-center"><p className="text-gray-500">No admitted patients found.</p></div>
                        ) : (
                            <div className="max-h-80 overflow-y-auto space-y-2">
                                {patients.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                                        <div>
                                            <p className="font-medium text-gray-900">{p.name}</p>
                                            <p className="text-xs text-gray-500">{p.ward ? `${p.ward} - Bed ${p.bed}` : 'No location assigned'}</p>
                                        </div>
                                        <button onClick={() => handleSelectPatient(p)} className="bg-blue-600 px-3 py-1.5 text-sm font-medium text-white rounded hover:bg-blue-700 transition-colors">Select</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button onClick={handleClosePatientModal} className="mt-4 w-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors">Cancel</button>
                    </div>
                </div>
            )}

            {/* CONFIRM ASSIGNMENT MODAL */}
            {selectedPatient && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto bg-white p-6 rounded-xl shadow-2xl">
                        <h2 className="mb-4 text-xl font-bold text-gray-800">Confirm Assignment</h2>
                        <div className="space-y-3 mb-4">
                            <div className="rounded-lg bg-gray-50 p-3">
                                <p className="text-sm text-gray-500">Patient</p>
                                <p className="font-medium text-gray-900">{selectedPatient.name}</p>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-3">
                                <p className="text-sm text-gray-500">Device MAC</p>
                                <p className="font-mono text-sm text-gray-900">{selectedMac}</p>
                            </div>
                        </div>

                        {/* CASCADING LOCATION DROPDOWNS */}
                        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <p className="text-sm font-semibold text-blue-800 mb-3">🛏️ Assign Device to Bed</p>
                            <div className="space-y-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">Floor <span className="text-red-500">*</span></label>
                                    <select value={selectedFloorId} onChange={(e) => { setSelectedFloorId(e.target.value); setSelectedWardId(''); setSelectedBedId(''); }} className="w-full border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded">
                                        <option value="">Select Floor</option>
                                        {hospitalData.map((floor) => (<option key={floor.id} value={floor.id}>{floor.name}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">Ward <span className="text-red-500">*</span></label>
                                    <select value={selectedWardId} onChange={(e) => { setSelectedWardId(e.target.value); setSelectedBedId(''); }} disabled={!selectedFloorId} className="w-full border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded disabled:bg-gray-100 disabled:cursor-not-allowed">
                                        <option value="">Select Ward</option>
                                        {availableWards.map((ward) => (<option key={ward.id} value={ward.id}>{ward.name}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">Available Bed <span className="text-red-500">*</span></label>
                                    <select value={selectedBedId} onChange={(e) => setSelectedBedId(e.target.value)} disabled={!selectedWardId} className="w-full border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded disabled:bg-gray-100 disabled:cursor-not-allowed">
                                        <option value="">Select Bed</option>
                                        {availableBeds.length > 0 ? (
                                            availableBeds.map((bed) => (<option key={bed.id} value={bed.id}>Bed {bed.bed_number} {bed.is_occupied ? '(Current)' : ''}</option>))
                                        ) : (
                                            <option value="" disabled>No available beds</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* FLUID TYPE */}
                        <div className="mb-3">
                            <label className="mb-1 block text-sm font-medium text-gray-700">Fluid Type <span className="text-red-500">*</span></label>
                            <select value={fluidType} onChange={(e) => setFluidType(e.target.value)} className="w-full border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded">
                                <option value="">Select Fluid Type</option>
                                <option value="iv_bag">IV Bag</option>
                                <option value="blood_bag">Blood Bag</option>
                            </select>
                        </div>

                        {/* FLUID CAPACITY */}
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-gray-700">Capacity <span className="text-red-500">*</span></label>
                            <select value={fluidCapacity} onChange={(e) => setFluidCapacity(e.target.value)} className="w-full border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded">
                                <option value="">Select Capacity</option>
                                <option value="500">500 ml</option>
                                <option value="1000">1000 ml</option>
                            </select>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex gap-3">
                            <button onClick={handleCancelAssignment} className="flex-1 bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 rounded transition-colors">Cancel</button>
                            <button disabled={!isFormValid || isAssigning} onClick={handleAssign} className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded transition-colors ${!isFormValid || isAssigning ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                                {isAssigning ? 'Assigning...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SUCCESS NOTIFICATION — auto-dismissed by refresh_devices event */}
            {showSuccess && (
                <div className="fixed bottom-5 right-5 z-[70] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                    <span>✅</span>
                    <span className="font-medium">Device Assigned — Waiting for node confirmation...</span>
                </div>
            )}
        </div>
    );
};

export default HomePage;