import React, { useState, useEffect } from 'react';
import Card from './Card';
import { patientApiService } from '../api/patientApi';

const PatientInfo = ({ patient, onBack, onDischarge }) => {
    const [patientDetail, setPatientDetail] = useState(patient);
    const [loading, setLoading] = useState(false);
    const [showDischargeConfirm, setShowDischargeConfirm] = useState(false);

    const getGenderDisplay = (gender) => {
        switch (gender.toLowerCase()) {
            case 'male':
                return 'Male';
            case 'female':
                return 'Female';
            case 'other':
                return 'Other';
            default:
                return gender;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const handleDischarge = () => {
        onDischarge(patient.id);
        setShowDischargeConfirm(false);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Patient List
                </button>
            </div>

            <Card className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{patientDetail.name}</h2>
                        <div className="flex items-center gap-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                ID: {patientDetail.id}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${patientDetail.discharged_at
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                                }`}>
                                {patientDetail.discharged_at ? 'Discharged' : 'Active'}
                            </span>
                        </div>
                    </div>
                    {!patientDetail.discharged_at && (
                        <button
                            onClick={() => setShowDischargeConfirm(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                        >
                            Discharge Patient
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-600 mb-2">Personal Information</h3>
                        <div className="space-y-2">
                            <div>
                                <span className="text-sm text-gray-500">Age:</span>
                                <p className="font-medium">{patientDetail.age}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Gender:</span>
                                <p className="font-medium">{getGenderDisplay(patientDetail.gender)}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Contact:</span>
                                <p className="font-medium">{patientDetail.contact}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-600 mb-2">Location Information</h3>
                        <div className="space-y-2">
                            <div>
                                <span className="text-sm text-gray-500">Floor:</span>
                                <p className="font-medium">{patientDetail.floor}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Ward:</span>
                                <p className="font-medium">{patientDetail.ward}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Bed:</span>
                                <p className="font-medium">{patientDetail.bed}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-600 mb-2">Admission Details</h3>
                        <div className="space-y-2">
                            <div>
                                <span className="text-sm text-gray-500">Admitted At:</span>
                                <p className="font-medium">{formatDate(patientDetail.admitted_at)}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Discharged At:</span>
                                <p className="font-medium">{patientDetail.discharged_at ? formatDate(patientDetail.discharged_at) : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Patient Bed Assignment History */}
                <div className="mt-6 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-600 mb-3">Patient Bed Assignment History</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bed</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned By</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {patientDetail.patient_bed_assignments?.map((entry) => (
                                    <tr key={entry.id}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{entry.bed.bed_number}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{entry.user.first_name} {entry.user.last_name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{formatDate(entry.start_time)}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {entry.end_time ? formatDate(entry.end_time) : <span className="text-green-600 font-medium">Currently Assigned</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Device Bed Assignment History */}
                <div className="mt-6 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-600 mb-3">Device Bed Assignment History</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned By</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bed</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {patientDetail.device_bed_assignments?.map((entry) => (
                                    <tr key={entry.id}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{entry.device.name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{entry.user.first_name} {entry.user.last_name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{entry.bed.bed_number}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{formatDate(entry.start_time)}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {entry.end_time ? formatDate(entry.end_time) : <span className="text-green-600 font-medium">Currently Assigned</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Card>

            {/* Discharge Confirmation Modal */}
            {showDischargeConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Discharge</h3>

                        <div className="mb-4">
                            <p className="text-gray-600">
                                Are you sure you want to discharge <strong>{patientDetail.name}</strong>?
                                This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDischargeConfirm(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDischarge}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Confirm Discharge
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientInfo;