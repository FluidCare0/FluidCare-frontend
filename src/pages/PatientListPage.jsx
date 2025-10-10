import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import PatientInfo from '../components/PatientInfo';
import { patientApiService } from '../api/patientApi';

const PatientListPage = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showAllPatients, setShowAllPatients] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterFloor, setFilterFloor] = useState('');
    const [filterWard, setFilterWard] = useState('');
    const [filterGender, setFilterGender] = useState('');
    const [newPatient, setNewPatient] = useState({
        name: '',
        age: '',
        gender: 'male',
        contact: '',
        admitted_at: '',
        floor: '',
        ward: '',
        bed: ''
    });
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showPatientInfo, setShowPatientInfo] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, [showAllPatients, searchTerm, filterStatus, filterFloor, filterWard, filterGender]);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (searchTerm) filters.search = searchTerm;
            if (filterStatus !== 'all') filters.status = filterStatus;
            if (filterGender) filters.gender = filterGender;

            const data = await patientApiService.getAllPatients(filters);
            setPatients(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching patients:', err);
            setError('Failed to load patients');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPatient = async () => {
        if (newPatient.name && newPatient.age && newPatient.contact && newPatient.admitted_at && newPatient.floor && newPatient.ward && newPatient.bed) {
            try {
                const patientData = {
                    ...newPatient,
                    age: parseInt(newPatient.age),
                    contact: parseInt(newPatient.contact)
                };

                const newPatientData = await patientApiService.createPatient(patientData);
                setPatients([...patients, newPatientData]);
                setNewPatient({
                    name: '',
                    age: '',
                    gender: 'male',
                    contact: '',
                    admitted_at: '',
                    floor: '',
                    ward: '',
                    bed: ''
                });
                setShowAddModal(false);
            } catch (err) {
                console.error('Error adding patient:', err);
                setError('Failed to add patient');
            }
        }
    };

    const handleDischargePatient = async (id) => {
        try {
            const dischargeData = { discharged_at: new Date().toISOString() };
            const updatedPatient = await patientApiService.dischargePatient(id, dischargeData);

            setPatients(patients.map(patient =>
                patient.id === id ? updatedPatient : patient
            ));

            if (showPatientInfo && selectedPatient && selectedPatient.id === id) {
                setShowPatientInfo(false);
                setSelectedPatient(null);
            }
        } catch (err) {
            console.error('Error discharging patient:', err);
            setError('Failed to discharge patient');
        }
    };

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

    const activePatients = patients.filter(patient => !patient.discharged_at);

    // Apply filters and search
    let filteredPatients = showAllPatients ? patients : activePatients;

    if (searchTerm) {
        filteredPatients = filteredPatients.filter(patient =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.id.toString().includes(searchTerm) ||
            patient.contact.toString().includes(searchTerm) ||
            patient.floor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.ward?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.bed?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    if (filterStatus === 'active') {
        filteredPatients = filteredPatients.filter(patient => !patient.discharged_at);
    } else if (filterStatus === 'discharged') {
        filteredPatients = filteredPatients.filter(patient => patient.discharged_at);
    }

    if (filterFloor) {
        filteredPatients = filteredPatients.filter(patient => patient.floor === filterFloor);
    }

    if (filterWard) {
        filteredPatients = filteredPatients.filter(patient => patient.ward === filterWard);
    }

    if (filterGender) {
        filteredPatients = filteredPatients.filter(patient => patient.gender === filterGender);
    }

    const uniqueFloors = [...new Set(patients.map(p => p.floor))];
    const uniqueWards = [...new Set(patients.map(p => p.ward))];
    const uniqueGenders = [...new Set(patients.map(p => p.gender))];

    if (showPatientInfo && selectedPatient) {
        return (
            <PatientInfo
                patient={selectedPatient}
                onBack={() => {
                    setShowPatientInfo(false);
                    setSelectedPatient(null);
                }}
                onDischarge={handleDischargePatient}
            />
        );
    }

    if (loading) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading patients...</div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Three Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Add New Patient Card */}
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Add New Patient</h3>
                    <p className="text-gray-600 mb-4">Register a new patient in the system</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Add Patient
                    </button>
                </Card>

                {/* Show All Patients Card */}
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Show All Patients</h3>
                    <p className="text-gray-600 mb-4">View complete patient list</p>
                    <div className="text-2xl font-bold text-gray-800 mb-2">{patients.length}</div>
                    <p className="text-sm text-gray-600">Total Patients</p>
                    <button
                        onClick={() => setShowAllPatients(!showAllPatients)}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                        {showAllPatients ? 'Show Active Only' : 'Show All Patients'}
                    </button>
                </Card>

                {/* Update Location Card */}
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Update Location</h3>
                    <p className="text-gray-600 mb-4">Update patient location and bed assignment</p>
                    <button
                        onClick={() => setShowUpdateModal(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                        Update Location
                    </button>
                </Card>
            </div>

            {/* Filter and Search Section */}
            {showAllPatients && (
                <Card className="p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div className="lg:col-span-2">
                            <input
                                type="text"
                                placeholder="Search patients..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="discharged">Discharged</option>
                            </select>
                        </div>
                        <div>
                            <select
                                value={filterFloor}
                                onChange={(e) => setFilterFloor(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Floors</option>
                                {uniqueFloors.map(floor => (
                                    <option key={floor} value={floor}>{floor}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <select
                                value={filterWard}
                                onChange={(e) => setFilterWard(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Wards</option>
                                {uniqueWards.map(ward => (
                                    <option key={ward} value={ward}>{ward}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <select
                                value={filterGender}
                                onChange={(e) => setFilterGender(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Genders</option>
                                {uniqueGenders.map(gender => (
                                    <option key={gender} value={gender}>{getGenderDisplay(gender)}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </Card>
            )}

            {/* Patients List Section */}
            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                        {showAllPatients ? 'List of All Patients' : 'List of Active Patients'}
                    </h3>
                    <div className="text-sm text-gray-600">
                        Showing {filteredPatients.length} of {showAllPatients ? patients.length : activePatients.length} patients
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admitted At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ward</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bed</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPatients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{patient.age}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{getGenderDisplay(patient.gender)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{patient.contact}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{formatDate(patient.admitted_at)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{patient.floor}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{patient.ward}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{patient.bed}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.discharged_at
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-green-100 text-green-800'
                                            }`}>
                                            {patient.discharged_at ? 'Discharged' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const patientDetail = await patientApiService.getPatientDetail(patient.id);
                                                    setSelectedPatient(patientDetail);
                                                    setShowPatientInfo(true);
                                                } catch (err) {
                                                    console.error('Error fetching patient detail:', err);
                                                    setError('Failed to load patient details');
                                                }
                                            }}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Info
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add Patient Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Patient</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={newPatient.name}
                                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter patient name"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                    <input
                                        type="number"
                                        value={newPatient.age}
                                        onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Age"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select
                                        value={newPatient.gender}
                                        onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                <input
                                    type="tel"
                                    value={newPatient.contact}
                                    onChange={(e) => setNewPatient({ ...newPatient, contact: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter contact number"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                                    <select
                                        value={newPatient.floor}
                                        onChange={(e) => setNewPatient({ ...newPatient, floor: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select floor</option>
                                        <option value="Floor 1">Floor 1</option>
                                        <option value="Floor 2">Floor 2</option>
                                        <option value="Floor 3">Floor 3</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
                                    <select
                                        value={newPatient.ward}
                                        onChange={(e) => setNewPatient({ ...newPatient, ward: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select ward</option>
                                        <option value="Ward A">Ward A</option>
                                        <option value="Ward B">Ward B</option>
                                        <option value="Ward C">Ward C</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bed Number</label>
                                <input
                                    type="text"
                                    value={newPatient.bed}
                                    onChange={(e) => setNewPatient({ ...newPatient, bed: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter bed number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={newPatient.admitted_at}
                                    onChange={(e) => setNewPatient({ ...newPatient, admitted_at: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddPatient}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add Patient
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Location Modal */}
            {showUpdateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Location</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">Select a patient</option>
                                    {activePatients.map(patient => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.name} (ID: {patient.id})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">Select floor</option>
                                    <option value="Floor 1">Floor 1</option>
                                    <option value="Floor 2">Floor 2</option>
                                    <option value="Floor 3">Floor 3</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">Select ward</option>
                                    <option value="Ward A">Ward A</option>
                                    <option value="Ward B">Ward B</option>
                                    <option value="Ward C">Ward C</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bed Number</label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">Select bed</option>
                                    <option value="Bed 101">Bed 101</option>
                                    <option value="Bed 102">Bed 102</option>
                                    <option value="Bed 201">Bed 201</option>
                                    <option value="Bed 202">Bed 202</option>
                                    <option value="Bed 301">Bed 301</option>
                                    <option value="Bed 302">Bed 302</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowUpdateModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Update Location
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientListPage;