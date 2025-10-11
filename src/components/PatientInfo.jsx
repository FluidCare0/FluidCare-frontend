// DeviceInfoPage.jsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { patientApiService } from '../api/patientApi'; // Import the API service

const DeviceInfoPage = ({ device, onBack }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [patientBedHistory, setPatientBedHistory] = useState([]);
    const [deviceBedHistory, setDeviceBedHistory] = useState([]); // This will now hold history for the specific device
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [error, setError] = useState(null);

    // Mock data for fluid level history (remains the same)
    const fluidLevelHistory = [
        { time: '08:00', level: 95 },
        { time: '09:00', level: 85 },
        { time: '10:00', level: 75 },
        { time: '11:00', level: 65 },
        { time: '12:00', level: 55 },
        { time: '13:00', level: 45 },
        { time: '14:00', level: 35 },
        { time: '15:00', level: 25 },
        { time: '16:00', level: 15 },
        { time: '17:00', level: 5 },
    ];

    // Mock data for patient info (remains the same, or derive from device prop if possible)
    // In a real scenario, you might fetch patient details separately if only device ID is provided initially.
    const patientInfo = {
        name: device.patient, // Assuming device object has patient name
        age: 45,
        gender: 'Male',
        admissionDate: '2023-10-15',
        diagnosis: 'Post-operative care',
        attendingDoctor: 'Dr. Smith',
        room: device.roomNo,
        ward: device.wardNo
    };

    // Fetch history data when the component mounts or when device changes
    useEffect(() => {
        const fetchHistoryData = async () => {
            if (!device.id) { // Ensure device ID is available
                console.error("Device object does not contain id. Cannot fetch device history.");
                setError("Device information is incomplete. Device history unavailable.");
                return;
            }

            setLoadingHistory(true);
            setError(null);
            try {
                // Fetch patient bed history for the associated patient (if patient_id exists)
                let patientHistory = [];
                if (device.patient_id) {
                    patientHistory = await patientApiService.getPatientBedHistory(device.patient_id);
                } else {
                    console.warn("Device object does not contain patient_id. Skipping patient bed history fetch.");
                }
                setPatientBedHistory(patientHistory);

                // Fetch device bed history for this specific device using the new API function
                const deviceHistory = await patientApiService.getDeviceHistoryByDeviceId(device.id);
                setDeviceBedHistory(deviceHistory);

            } catch (err) {
                console.error('Error fetching history ', err);
                setError('Failed to load history: ' + (err.response?.data?.error || err.message || 'Unknown error'));
                // Optionally, set empty arrays or keep previous data
                setPatientBedHistory([]);
                setDeviceBedHistory([]);
            } finally {
                setLoadingHistory(false);
            }
        };

        fetchHistoryData();
    }, [device.patient_id, device.id]); // Fetch when patient_id or device.id changes

    // Helper function to get user display name safely
    const getUserDisplayName = (user) => {
        if (!user) return 'Unknown User';
        return user.name || 'Unnamed User';
    };

    // Helper function to get bed display name safely
    const getBedDisplayName = (bed) => {
        if (!bed) return 'Unknown Bed';
        return `Bed ${bed.bed_number} - Ward ${bed.ward.ward_number}`;
    };

    // Helper function to format date safely
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString(); // Example: "10/11/2025, 2:30:00 PM"
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Device Information</h1>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Patient Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Patient Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-600">Name</h3>
                        <p className="text-lg font-semibold">{patientInfo.name}</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-600">Age</h3>
                        <p className="text-lg font-semibold">{patientInfo.age}</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-600">Gender</h3>
                        <p className="text-lg font-semibold">{patientInfo.gender}</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-600">Admission Date</h3>
                        <p className="text-lg font-semibold">{patientInfo.admissionDate}</p>
                    </div>
                </div>
            </div>

            {/* Device Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Device Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-600">Device ID</h3>
                        <p className="text-lg font-semibold">{device.id || device.deviceId}</p> {/* Prefer 'id' if available */}
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-600">Current Level</h3>
                        <p className="text-lg font-semibold">{device.level}%</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-600">Ward</h3>
                        <p className="text-lg font-semibold">{device.wardNo}</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-600">Room</h3>
                        <p className="text-lg font-semibold">{device.roomNo}</p>
                    </div>
                </div>
            </div>

            {/* Fluid Level Chart */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Fluid Level History</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={fluidLevelHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip
                            formatter={(value) => [`${value}%`, 'Level']}
                            labelFormatter={(label) => `Time: ${label}`}
                        />
                        <Line
                            type="monotone"
                            dataKey="level"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            name="Level (%)"
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Advanced Info Toggle */}
            <div className="mb-6">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                    <svg
                        className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7-7-7-7" />
                    </svg>
                    {showAdvanced ? 'Hide Advanced Information' : 'Show Advanced Information'}
                </button>
            </div>

            {/* Advanced Information - Hidden by default */}
            {showAdvanced && (
                <>
                    {/* Loading indicator */}
                    {loadingHistory && (
                        <div className="bg-white rounded-xl shadow-md p-6 mb-6 text-center">
                            <p className="text-gray-600">Loading history...</p>
                        </div>
                    )}

                    {/* Patient Bed Assignment History */}
                    {device.patient_id && ( // Only show if patient_id exists
                        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Patient Bed Assignment History</h2>
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.patient.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getUserDisplayName(entry.user)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getBedDisplayName(entry.bed)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(entry.start_time)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {entry.end_time ? formatDate(entry.end_time) : <span className="text-green-600 font-medium">Currently Assigned</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Device Bed Assignment History */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Device Bed Assignment History</h2>
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.device.name || entry.device.mac_address}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getUserDisplayName(entry.user)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getBedDisplayName(entry.bed)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(entry.start_time)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {entry.end_time ? formatDate(entry.end_time) : <span className="text-green-600 font-medium">Currently Assigned</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DeviceInfoPage;