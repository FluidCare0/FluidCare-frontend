// src/pages/DeviceInfoPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
    getPatientDetailsByDevice,
    getPatientAssignmentHistoryByDevice,
    getDeviceAssignmentHistory,
    getSensorHistory,
} from '../api/deviceApi';
import { transformDeviceData } from '../api/helperFunctions';
import WebSocketStatus from '../components/WebSocketStatus';

const DeviceInfoPage = ({ device, onBack }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [patientInfo, setPatientInfo] = useState(null);
    const [fluidLevelHistory, setFluidLevelHistory] = useState([]);
    const [patientBedHistory, setPatientBedHistory] = useState([]);
    const [deviceBedHistory, setDeviceBedHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!device?.id) {
            setError('Device ID is missing.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const patientData = await getPatientDetailsByDevice(device.id);
            if (patientData && patientData.detail !== 'No patient currently assigned to this device.') {
                setPatientInfo(patientData);
            } else {
                setPatientInfo(null);
            }

            const patientBedHist = await getPatientAssignmentHistoryByDevice(device.id);
            setPatientBedHistory(patientBedHist);

            const deviceBedHist = await getDeviceAssignmentHistory(device.id);
            setDeviceBedHistory(deviceBedHist);

            // Fetch historical sensor readings for the chart
            const sensorHist = await getSensorHistory(device.id);
            const mappedHistory = sensorHist.map((reading) => ({
                time: new Date(reading.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                level: reading.level,
                smoothed: reading.smoothed_weight ?? reading.level,
            }));
            setFluidLevelHistory(mappedHistory);
        } catch (err) {
            console.error('Error fetching device details:', err);
            setError('Failed to load device information. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [device]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Append a live point whenever a real-time WebSocket reading arrives
    useEffect(() => {
        if (device?.level == null) return;
        const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setFluidLevelHistory((prev) => [
            ...prev.slice(-59),
            {
                time: timeLabel,
                level: device.level,
                smoothed: device.smoothedWeight ?? device.level,
            },
        ]);
    }, [device?.level, device?.smoothedWeight]);

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading device information...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>
                <div className="mb-6 p-4 bg-red-50 border border-red-200">
                    <span className="text-red-800 font-medium">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">Device Information</h1>
                    <div className="flex items-center gap-3">
                        <WebSocketStatus />
                        <button
                            onClick={fetchData}
                            className="px-4 py-2 bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors shadow-sm"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Patient Info */}
            {patientInfo && (
                <div className="bg-white shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Patient Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="border border-gray-200 p-4">
                            <h3 className="font-medium text-gray-600">Name</h3>
                            <p className="text-lg font-semibold">{patientInfo.name}</p>
                        </div>
                        <div className="border border-gray-200 p-4">
                            <h3 className="font-medium text-gray-600">Age</h3>
                            <p className="text-lg font-semibold">{patientInfo.age}</p>
                        </div>
                        <div className="border border-gray-200 p-4">
                            <h3 className="font-medium text-gray-600">Gender</h3>
                            <p className="text-lg font-semibold">{patientInfo.gender}</p>
                        </div>
                        <div className="border border-gray-200 p-4">
                            <h3 className="font-medium text-gray-600">Admission Date</h3>
                            <p className="text-lg font-semibold">
                                {patientInfo.admitted_at ? new Date(patientInfo.admitted_at).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Device Info */}
            <div className="bg-white shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Device Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="border border-gray-200 p-4">
                        <h3 className="font-medium text-gray-600">Device ID</h3>
                        <p className="text-lg font-semibold">{device.id || device.nodeId || 'N/A'}</p>
                    </div>
                    <div className="border border-gray-200 p-4">
                        <h3 className="font-medium text-gray-600">Current Level (raw)</h3>
                        <p className="text-lg font-semibold">{device.level}%</p>
                    </div>
                    <div className="border border-blue-200 p-4 bg-blue-50">
                        <h3 className="font-medium text-blue-600">Smoothed Weight</h3>
                        <p className="text-lg font-semibold text-blue-700">
                            {device.smoothedWeight != null ? `${device.smoothedWeight.toFixed(1)} g` : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">EWMA α=0.2</p>
                    </div>
                    <div className="border border-gray-200 p-4">
                        <h3 className="font-medium text-gray-600">Ward</h3>
                        <p className="text-lg font-semibold">{device.ward || device.wardNo || 'N/A'}</p>
                    </div>
                    <div className="border border-gray-200 p-4">
                        <h3 className="font-medium text-gray-600">Room</h3>
                        <p className="text-lg font-semibold">{device.bed || device.roomNo || 'N/A'}</p>
                    </div>
                    <div className="border border-gray-200 p-4">
                        <h3 className="font-medium text-gray-600">Status</h3>
                        <p className="text-lg font-semibold">{device.status}</p>
                    </div>
                    <div className="border border-gray-200 p-4">
                        <h3 className="font-medium text-gray-600">Last Reading</h3>
                        <p className="text-lg font-semibold">
                            {device.lastReading ? new Date(device.lastReading).toLocaleString() : 'N/A'}
                        </p>
                    </div>
                    <div className="border border-gray-200 p-4">
                        <h3 className="font-medium text-gray-600">Battery</h3>
                        <p className="text-lg font-semibold">
                            {device.batteryPercent != null ? `${Math.round(device.batteryPercent)}%` : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Fluid Level Chart — raw scatter + smoothed line */}
            <div className="bg-white shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Fluid Level History</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={fluidLevelHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip
                            formatter={(value, name) => [
                                name === 'smoothed'
                                    ? `${Number(value).toFixed(1)} g`
                                    : `${value}`,
                                name === 'smoothed' ? 'Smoothed (g)' : 'Raw level',
                            ]}
                            labelFormatter={(label) => `Time: ${label}`}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="level"
                            stroke="#94A3B8"
                            strokeWidth={1}
                            dot={false}
                            name="Raw level"
                        />
                        <Line
                            type="monotone"
                            dataKey="smoothed"
                            stroke="#3B82F6"
                            strokeWidth={2.5}
                            dot={false}
                            name="Smoothed (g)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Advanced toggle */}
            <div className="mb-6">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                    <svg
                        className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {showAdvanced ? 'Hide Advanced Information' : 'Show Advanced Information'}
                </button>
            </div>

            {showAdvanced && (
                <>
                    {/* Patient Bed Assignment History */}
                    <div className="bg-white shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Patient Bed Assignment History</h2>
                        {patientBedHistory.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned By</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bed</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {patientBedHistory.map((entry) => (
                                            <tr key={entry.id}>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{entry.patient_name || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{entry.user_name || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{entry.bed_number || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{new Date(entry.start_time).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {entry.end_time
                                                        ? new Date(entry.end_time).toLocaleString()
                                                        : <span className="text-green-600 font-medium">Currently Assigned</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No patient bed assignment history found.</p>
                        )}
                    </div>

                    {/* Device Bed Assignment History */}
                    <div className="bg-white shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Device Bed Assignment History</h2>
                        {deviceBedHistory.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned By</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bed</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {deviceBedHistory.map((entry) => (
                                            <tr key={entry.id}>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{entry.device?.mac_address || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{entry.user_name || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{entry.bed_number || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{new Date(entry.start_time).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {entry.end_time
                                                        ? new Date(entry.end_time).toLocaleString()
                                                        : <span className="text-green-600 font-medium">Currently Assigned</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No device bed assignment history found.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default DeviceInfoPage;
