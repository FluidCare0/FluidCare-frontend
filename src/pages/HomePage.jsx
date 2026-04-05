import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DeviceCard from '../components/DeviceCard';
import Card from '../components/Card';
import { getAllDevices } from '../api/deviceApi';
import { transformDeviceData, processSensorData, calculateDeviceStatus } from '../api/helperFunctions';
import WebSocketStatus from '../components/WebSocketStatus';
import { useSensorWebSocket } from '../hooks/useSensorWebSocket';

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

    // Handle live sensor data from WebSocket
    const handleSensorData = useCallback((data) => {
        const processed = processSensorData(data.message || data);
        setDevices((prev) =>
            prev.map((device) => {
                if (device.id !== processed.nodeId) return device;
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

    useSensorWebSocket({ onSensorData: handleSensorData });

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

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Active Devices</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Showing {filteredDevices.length} of {devices.length} devices
                    </p>
                </div>

                <div className="flex items-center flex-wrap gap-3">
                    <WebSocketStatus label="Device Sync" />
                    <button
                        onClick={() => setViewMode((current) => (current === 'card' ? 'list' : 'card'))}
                        className="bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
                    >
                        {viewMode === 'card' ? 'List View' : 'Card View'}
                    </button>
                    <button
                        onClick={fetchDevices}
                        className="bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            <Card className="mb-6 p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                            Ward
                        </label>
                        <select
                            value={wardFilter}
                            onChange={(event) => setWardFilter(event.target.value)}
                            className="w-full border border-gray-300 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Wards</option>
                            {uniqueWards.map((ward) => (
                                <option key={ward} value={ward}>
                                    {ward}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="w-full border border-gray-300 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Status</option>
                            {uniqueStatuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setWardFilter('');
                                setStatusFilter('');
                            }}
                            className="w-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </Card>

            {error && (
                <div className="mb-6 border border-red-300 bg-red-50 px-4 py-3 text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="text-lg text-gray-600">Loading devices...</div>
                </div>
            ) : filteredDevices.length === 0 ? (
                <Card className="p-10 text-center">
                    <h3 className="text-lg font-semibold text-gray-800">No devices found</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Try changing the filters or refresh the data.
                    </p>
                </Card>
            ) : viewMode === 'card' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredDevices.map((device) => (
                        <DeviceCard
                            key={device.id}
                            device={device}
                            onShowDetails={() => setSelectedDevice(device)}
                        />
                    ))}
                </div>
            ) : (
                <Card className="overflow-x-auto p-0">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Device
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Patient
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Ward
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Level
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredDevices.map((device) => (
                                <tr key={device.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        #{device.id}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {device.patient || 'No Patient'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{device.ward}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{device.level}%</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{device.status}</td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        <button
                                            onClick={() => setSelectedDevice(device)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {selectedDevice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">Device Details</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Live snapshot for device #{selectedDevice.id}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedDevice(null)}
                                className="text-2xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Card className="p-4">
                                <p className="text-sm text-gray-500">Patient</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {selectedDevice.patient || 'No Patient'}
                                </p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-sm text-gray-500">Ward</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {selectedDevice.ward || 'N/A'}
                                </p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-sm text-gray-500">Bed</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {selectedDevice.bed || 'N/A'}
                                </p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {selectedDevice.status || 'Unknown'}
                                </p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-sm text-gray-500">Fluid Level (raw)</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {selectedDevice.level ?? 0}%
                                </p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-sm text-gray-500">Smoothed Weight</p>
                                <p className="mt-1 text-lg font-semibold text-blue-700">
                                    {selectedDevice.smoothedWeight != null
                                        ? `${selectedDevice.smoothedWeight.toFixed(1)} g`
                                        : 'N/A'}
                                </p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-sm text-gray-500">Battery</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {selectedDevice.batteryPercent ?? 'N/A'}
                                    {selectedDevice.batteryPercent != null ? '%' : ''}
                                </p>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
