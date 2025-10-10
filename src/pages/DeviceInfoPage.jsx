import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DeviceInfoPage = ({ device, onBack }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Mock data for fluid level history
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

    // Mock data for patient info
    const patientInfo = {
        name: device.patient,
        age: 45,
        gender: 'Male',
        admissionDate: '2023-10-15',
        diagnosis: 'Post-operative care',
        attendingDoctor: 'Dr. Smith',
        room: device.roomNo,
        ward: device.wardNo
    };

    // Mock data for PatientBedAssignmentHistory
    const patientBedHistory = [
        {
            id: 1,
            patient: "John Doe",
            assignedBy: "Dr. Smith",
            bed: "Bed-101",
            startTime: "2023-10-15 08:00",
            endTime: "2023-10-16 10:00"
        },
        {
            id: 2,
            patient: "John Doe",
            assignedBy: "Nurse Jane",
            bed: "Bed-205",
            startTime: "2023-10-16 10:00",
            endTime: "2023-10-17 14:00"
        },
        {
            id: 3,
            patient: "John Doe",
            assignedBy: "Dr. Brown",
            bed: "Bed-101",
            startTime: "2023-10-17 14:00",
            endTime: null // Currently assigned
        }
    ];

    // Mock data for DeviceBedAssignmentHistory
    const deviceBedHistory = [
        {
            id: 1,
            device: "IV-001",
            assignedBy: "Tech John",
            bed: "Bed-101",
            startTime: "2023-10-15 08:00",
            endTime: "2023-10-16 10:00"
        },
        {
            id: 2,
            device: "IV-001",
            assignedBy: "Tech Sarah",
            bed: "Bed-205",
            startTime: "2023-10-16 10:00",
            endTime: "2023-10-17 14:00"
        },
        {
            id: 3,
            device: "IV-001",
            assignedBy: "Tech Mike",
            bed: "Bed-101",
            startTime: "2023-10-17 14:00",
            endTime: null // Currently assigned
        }
    ];

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
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-600">Diagnosis</h3>
                        <p className="text-lg font-semibold">{patientInfo.diagnosis}</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-600">Attending Doctor</h3>
                        <p className="text-lg font-semibold">{patientInfo.attendingDoctor}</p>
                    </div>
                </div>
            </div>

            {/* Device Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Device Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-600">Device ID</h3>
                        <p className="text-lg font-semibold">{device.deviceId}</p>
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {showAdvanced ? 'Hide Advanced Information' : 'Show Advanced Information'}
                </button>
            </div>

            {/* Advanced Information - Hidden by default */}
            {showAdvanced && (
                <>
                    {/* Patient Bed Assignment History */}
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.patient}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.assignedBy}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.bed}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.startTime}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {entry.endTime ? entry.endTime : <span className="text-green-600 font-medium">Currently Assigned</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.device}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.assignedBy}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.bed}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.startTime}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {entry.endTime ? entry.endTime : <span className="text-green-600 font-medium">Currently Assigned</span>}
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