import React, { useEffect, useMemo, useState } from 'react';
import { UserPlus, Users, LayoutDashboard } from 'lucide-react';
import Card from '../components/Card';
import { patientApiService } from '../api/patientApi';

const emptyPatient = {
    name: '',
    age: '',
    gender: 'male',
    contact: '',
};

const PatientListPage = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAllPatients, setShowAllPatients] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterFloor, setFilterFloor] = useState('');
    const [filterWard, setFilterWard] = useState('');
    const [filterGender, setFilterGender] = useState('');
    const [newPatient, setNewPatient] = useState(emptyPatient);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            setError('');
            const filters = {};

            if (searchTerm) {
                filters.search = searchTerm;
            }

            if (filterStatus !== 'all') {
                filters.status = filterStatus;
            }

            if (filterGender) {
                filters.gender = filterGender;
            }

            const data = await patientApiService.getAllPatients(filters);
            setPatients(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load patients:', err);
            setError('Failed to load patients.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, [filterGender, filterStatus, searchTerm]);

    const filteredPatients = useMemo(() => {
        let result = showAllPatients
            ? [...patients]
            : patients.filter((patient) => !patient.discharged_at);

        if (searchTerm) {
            const query = searchTerm.toLowerCase();
            result = result.filter((patient) => {
                return (
                    patient.name?.toLowerCase().includes(query) ||
                    String(patient.id).includes(query) ||
                    String(patient.contact || '').includes(query) ||
                    String(patient.floor || '').includes(query) ||
                    String(patient.ward || '').includes(query) ||
                    String(patient.bed || '').includes(query)
                );
            });
        }

        if (filterFloor) {
            result = result.filter((patient) => String(patient.floor) === filterFloor);
        }

        if (filterWard) {
            result = result.filter((patient) => String(patient.ward) === filterWard);
        }

        return result;
    }, [filterFloor, filterWard, patients, searchTerm, showAllPatients]);

    const recentAdmitted = useMemo(() => {
        return [...patients]
            .filter((patient) => patient.admitted_at && !patient.discharged_at)
            .sort((left, right) => new Date(right.admitted_at) - new Date(left.admitted_at))
            .slice(0, 5);
    }, [patients]);

    const recentDischarged = useMemo(() => {
        return [...patients]
            .filter((patient) => patient.discharged_at)
            .sort((left, right) => new Date(right.discharged_at) - new Date(left.discharged_at))
            .slice(0, 5);
    }, [patients]);

    const uniqueFloors = useMemo(() => {
        return [...new Set(patients.map((patient) => patient.floor).filter((value) => value != null))];
    }, [patients]);

    const uniqueWards = useMemo(() => {
        return [...new Set(patients.map((patient) => patient.ward).filter((value) => value != null))];
    }, [patients]);

    const uniqueGenders = useMemo(() => {
        return [...new Set(patients.map((patient) => patient.gender).filter(Boolean))];
    }, [patients]);

    const formatDate = (value) => {
        if (!value) {
            return 'N/A';
        }

        return new Date(value).toLocaleString();
    };

    const getGenderDisplay = (gender) => {
        if (!gender) {
            return 'N/A';
        }

        const normalized = gender.toLowerCase();

        if (normalized === 'male') {
            return 'Male';
        }

        if (normalized === 'female') {
            return 'Female';
        }

        if (normalized === 'other') {
            return 'Other';
        }

        return gender;
    };

    const handleAddPatient = async () => {
        if (!newPatient.name || !newPatient.age || !newPatient.contact) {
            window.alert('Please fill in all required fields.');
            return;
        }

        try {
            const payload = {
                name: newPatient.name,
                age: Number(newPatient.age),
                gender: newPatient.gender,
                contact: newPatient.contact,
                admitted_at: new Date().toISOString(),
            };

            await patientApiService.createPatient(payload);
            setNewPatient(emptyPatient);
            setShowAddModal(false);
            await fetchPatients();
        } catch (err) {
            console.error('Failed to add patient:', err);
            window.alert('Failed to add patient.');
        }
    };

    const handleViewPatient = async (patientId) => {
        try {
            const detail = await patientApiService.getPatientDetail(patientId);
            setSelectedPatient(detail);
        } catch (err) {
            console.error('Failed to load patient details:', err);
            window.alert('Failed to load patient details.');
        }
    };

    const handleDischargePatient = async (patientId) => {
        try {
            const payload = {
                discharged_at: new Date().toISOString(),
            };

            await patientApiService.dischargePatient(patientId, payload);
            setSelectedPatient(null);
            await fetchPatients();
        } catch (err) {
            console.error('Failed to discharge patient:', err);
            window.alert('Failed to discharge patient.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="flex h-64 items-center justify-center text-lg text-gray-600">
                    Loading patients...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Patient Management</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        {showAllPatients ? 'Full directory of all registered patients' : 'Overview of recent patient activity'}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setShowAllPatients(!showAllPatients)}
                        className="flex flex-1 justify-center items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors sm:flex-none"
                    >
                        {showAllPatients ? <LayoutDashboard size={18} /> : <Users size={18} />}
                        {showAllPatients ? 'Summary View' : 'All Patients'}
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex flex-1 justify-center items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors sm:flex-none"
                    >
                        <UserPlus size={18} /> Add Patient
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 border border-red-300 bg-red-50 px-4 py-3 text-red-700">
                    {error}
                </div>
            )}

            {!showAllPatients ? (
                <>
                    <Card className="mb-8 p-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">
                            Recently Admitted Patients
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Name
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Admitted At
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Floor
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Ward
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Bed
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {recentAdmitted.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                                {patient.name}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-700">
                                                {formatDate(patient.admitted_at)}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-700">
                                                {patient.floor || 'N/A'}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-700">
                                                {patient.ward || 'N/A'}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-700">
                                                {patient.bed || 'N/A'}
                                            </td>
                                            <td className="px-4 py-2 text-sm font-medium">
                                                <button
                                                    onClick={() => handleViewPatient(patient.id)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">
                            Recently Discharged Patients
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Name
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Discharged At
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Floor
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Ward
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Bed
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {recentDischarged.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                                {patient.name}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-700">
                                                {formatDate(patient.discharged_at)}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-700">
                                                {patient.floor || 'N/A'}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-700">
                                                {patient.ward || 'N/A'}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-700">
                                                {patient.bed || 'N/A'}
                                            </td>
                                            <td className="px-4 py-2 text-sm font-medium">
                                                <button
                                                    onClick={() => handleViewPatient(patient.id)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            ) : (
                <>
                    <Card className="mb-6 p-4 sm:p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Name, ID, Bed..."
                                    className="w-full border border-gray-300 px-4 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                                    Status
                                </label>
                                <select
                                    value={filterStatus}
                                    onChange={(event) => setFilterStatus(event.target.value)}
                                    className="w-full border border-gray-300 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="discharged">Discharged</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                                    Floor
                                </label>
                                <select
                                    value={filterFloor}
                                    onChange={(event) => setFilterFloor(event.target.value)}
                                    className="w-full border border-gray-300 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Floors</option>
                                    {uniqueFloors.map((floor) => (
                                        <option key={floor} value={String(floor)}>
                                            Floor {floor}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                                    Ward
                                </label>
                                <select
                                    value={filterWard}
                                    onChange={(event) => setFilterWard(event.target.value)}
                                    className="w-full border border-gray-300 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Wards</option>
                                    {uniqueWards.map((ward) => (
                                        <option key={ward} value={String(ward)}>
                                            Ward {ward}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                                    Gender
                                </label>
                                <select
                                    value={filterGender}
                                    onChange={(event) => setFilterGender(event.target.value)}
                                    className="w-full border border-gray-300 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Genders</option>
                                    {uniqueGenders.map((gender) => (
                                        <option key={gender} value={gender}>
                                            {getGenderDisplay(gender)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 sm:p-6">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Patient Directory</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Showing {filteredPatients.length} records
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Age
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Gender
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Admitted At
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Floor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Ward
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Bed
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
                                    {filteredPatients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {patient.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{patient.age}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {getGenderDisplay(patient.gender)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {patient.contact}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {formatDate(patient.admitted_at)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {patient.floor || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {patient.ward || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {patient.bed || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold ${patient.discharged_at
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-green-100 text-green-800'
                                                        }`}
                                                >
                                                    {patient.discharged_at ? 'Discharged' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                <button
                                                    onClick={() => handleViewPatient(patient.id)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-md bg-white p-6 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-800">Add New Patient</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={newPatient.name}
                                    onChange={(event) =>
                                        setNewPatient((current) => ({
                                            ...current,
                                            name: event.target.value,
                                        }))
                                    }
                                    className="w-full border border-gray-300 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        value={newPatient.age}
                                        onChange={(event) =>
                                            setNewPatient((current) => ({
                                                ...current,
                                                age: event.target.value,
                                            }))
                                        }
                                        className="w-full border border-gray-300 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                                        Gender
                                    </label>
                                    <select
                                        value={newPatient.gender}
                                        onChange={(event) =>
                                            setNewPatient((current) => ({
                                                ...current,
                                                gender: event.target.value,
                                            }))
                                        }
                                        className="w-full border border-gray-300 bg-white px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">
                                    Contact Number
                                </label>
                                <input
                                    type="tel"
                                    value={newPatient.contact}
                                    onChange={(event) =>
                                        setNewPatient((current) => ({
                                            ...current,
                                            contact: event.target.value,
                                        }))
                                    }
                                    className="w-full border border-gray-300 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="bg-gray-100 px-6 py-2.5 font-bold text-gray-700 hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddPatient}
                                className="bg-blue-600 px-6 py-2.5 font-bold text-white hover:bg-blue-700"
                            >
                                Register Patient
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">
                                    {selectedPatient.name}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Patient ID #{selectedPatient.id}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedPatient(null)}
                                className="text-2xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Card className="p-4">
                                <p className="text-sm text-gray-500">Age</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {selectedPatient.age}
                                </p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-sm text-gray-500">Gender</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {getGenderDisplay(selectedPatient.gender)}
                                </p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-sm text-gray-500">Contact</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {selectedPatient.contact || 'N/A'}
                                </p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-sm text-gray-500">Admitted At</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {formatDate(selectedPatient.admitted_at)}
                                </p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-sm text-gray-500">Current Floor</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {selectedPatient.current_floor || selectedPatient.floor || 'N/A'}
                                </p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-sm text-gray-500">Current Ward / Bed</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {selectedPatient.current_ward || selectedPatient.ward || 'N/A'} /{' '}
                                    {selectedPatient.current_bed || selectedPatient.bed || 'N/A'}
                                </p>
                            </Card>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedPatient(null)}
                                className="bg-gray-100 px-4 py-2 font-medium text-gray-700 hover:bg-gray-200"
                            >
                                Close
                            </button>
                            {!selectedPatient.discharged_at && (
                                <button
                                    onClick={() => handleDischargePatient(selectedPatient.id)}
                                    className="bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                                >
                                    Discharge Patient
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientListPage;
