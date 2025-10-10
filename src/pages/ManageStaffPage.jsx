import React, { useState, useEffect } from 'react';
import Card from '../components/Card';

const ManageStaffPage = () => {
    // Mock data for staff members
    const [staffMembers, setStaffMembers] = useState([
        {
            id: 1,
            name: "John Doe",
            mobile: "+1234567890",
            email: "john.doe@hospital.com",
            role: "manager",
            is_active: true,
            is_email_verified: true,
            created_at: "2023-01-15",
            updated_at: "2023-10-01"
        },
        {
            id: 2,
            name: "Jane Smith",
            mobile: "+1234567891",
            email: "jane.smith@hospital.com",
            role: "user",
            is_active: true,
            is_email_verified: true,
            created_at: "2023-02-20",
            updated_at: "2023-09-15"
        },
        {
            id: 3,
            name: "Mike Johnson",
            mobile: "+1234567892",
            email: "mike.johnson@hospital.com",
            role: "user",
            is_active: false,
            is_email_verified: false,
            created_at: "2023-03-10",
            updated_at: "2023-08-20"
        },
        {
            id: 4,
            name: "Sarah Wilson",
            mobile: "+1234567893",
            email: "sarah.wilson@hospital.com",
            role: "root_admin",
            is_active: true,
            is_email_verified: true,
            created_at: "2023-01-05",
            updated_at: "2023-10-05"
        },
        {
            id: 5,
            name: "Robert Brown",
            mobile: "+1234567894",
            email: "robert.brown@hospital.com",
            role: "manager",
            is_active: true,
            is_email_verified: false,
            created_at: "2023-04-05",
            updated_at: "2023-07-10"
        }
    ]);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentStaff, setCurrentStaff] = useState(null);
    const [newStaff, setNewStaff] = useState({
        name: '',
        mobile: '',
        email: '',
        role: 'user'
    });

    // Apply filters and search
    const filteredStaff = staffMembers.filter(staff => {
        const matchesSearch = searchTerm === '' ||
            staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.mobile.includes(searchTerm) ||
            staff.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = filterRole === '' || staff.role === filterRole;
        const matchesStatus = filterStatus === '' ||
            (filterStatus === 'active' && staff.is_active) ||
            (filterStatus === 'inactive' && !staff.is_active);

        return matchesSearch && matchesRole && matchesStatus;
    });

    const handleAddStaff = () => {
        const staff = {
            id: staffMembers.length + 1,
            ...newStaff,
            is_active: true,
            is_email_verified: false,
            created_at: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString().split('T')[0]
        };
        setStaffMembers([...staffMembers, staff]);
        setNewStaff({ name: '', mobile: '', email: '', role: 'user' });
        setShowAddModal(false);
    };

    const handleEditStaff = () => {
        setStaffMembers(staffMembers.map(staff =>
            staff.id === currentStaff.id ? currentStaff : staff
        ));
        setShowEditModal(false);
    };

    const handleDeleteStaff = (id) => {
        setStaffMembers(staffMembers.filter(staff => staff.id !== id));
    };

    const handleToggleStatus = (id) => {
        setStaffMembers(staffMembers.map(staff =>
            staff.id === id ? { ...staff, is_active: !staff.is_active } : staff
        ));
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterRole('');
        setFilterStatus('');
    };

    const getRoleDisplay = (role) => {
        switch (role) {
            case 'root_admin': return 'Root Admin';
            case 'manager': return 'Manager';
            case 'user': return 'User';
            default: return role;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'root_admin': return 'bg-purple-100 text-purple-800';
            case 'manager': return 'bg-blue-100 text-blue-800';
            case 'user': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Manage Staff</h2>

            {/* Search and Filters Section */}
            <Card className="p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search Bar */}
                    <div className="lg:col-span-2">
                        <input
                            type="text"
                            placeholder="Search by name, mobile, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Role Filter */}
                    <div>
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Roles</option>
                            <option value="root_admin">Root Admin</option>
                            <option value="manager">Manager</option>
                            <option value="user">User</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Clear Filters Button */}
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            </Card>

            {/* Add Staff Button */}
            <div className="mb-6">
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Staff
                </button>
            </div>

            {/* Staff Table */}
            <Card className="p-6">
                <div className="mb-4 text-sm text-gray-600">
                    Showing {filteredStaff.length} of {staffMembers.length} staff members
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStaff.map((staff) => (
                                <tr key={staff.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{staff.mobile}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(staff.role)}`}>
                                            {getRoleDisplay(staff.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${staff.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {staff.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => {
                                                    setCurrentStaff(staff);
                                                    setShowEditModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                                title="Edit"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(staff.id)}
                                                className={`${staff.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                                                    } p-1 rounded hover:bg-gray-50 transition-colors`}
                                                title={staff.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                                {staff.is_active ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStaff(staff.id)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                                title="Delete"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995 5.11L5 12m2 0l2-2h2l2 2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add Staff Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Staff</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={newStaff.name}
                                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                <input
                                    type="tel"
                                    value={newStaff.mobile}
                                    onChange={(e) => setNewStaff({ ...newStaff, mobile: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter mobile number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newStaff.email}
                                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={newStaff.role}
                                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="user">User</option>
                                    <option value="manager">Manager</option>
                                    <option value="root_admin">Root Admin</option>
                                </select>
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
                                onClick={handleAddStaff}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add Staff
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Staff Modal */}
            {showEditModal && currentStaff && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Staff</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={currentStaff.name}
                                    onChange={(e) => setCurrentStaff({ ...currentStaff, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                <input
                                    type="tel"
                                    value={currentStaff.mobile}
                                    onChange={(e) => setCurrentStaff({ ...currentStaff, mobile: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={currentStaff.email}
                                    onChange={(e) => setCurrentStaff({ ...currentStaff, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={currentStaff.role}
                                    onChange={(e) => setCurrentStaff({ ...currentStaff, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="user">User</option>
                                    <option value="manager">Manager</option>
                                    <option value="root_admin">Root Admin</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={currentStaff.is_active}
                                    onChange={(e) => setCurrentStaff({ ...currentStaff, is_active: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                                    Active Status
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditStaff}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Update Staff
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageStaffPage;