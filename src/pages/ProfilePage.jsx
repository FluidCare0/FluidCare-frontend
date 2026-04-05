import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import api from '../api/api';
import { toast } from 'react-toastify';
import { User as UserIcon, Mail, Phone, Shield, Save } from 'lucide-react';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Editable fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            setLoading(true);
            const response = await api.get('auth/user/');
            const userData = response.data;
            setUser(userData);
            setName(userData.name || '');
            setEmail(userData.email || '');
        } catch (error) {
            console.error('Failed to fetch user:', error);
            toast.error('Failed to load profile details');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            const response = await api.put('auth/profile-info/', { name, email });
            setUser(response.data.user);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Failed to update profile:', error);
            if (error.response?.data) {
                // Show first validation error message if available
                const errData = error.response.data;
                const firstKey = Object.keys(errData)[0];
                if (firstKey && Array.isArray(errData[firstKey])) {
                    toast.error(errData[firstKey][0]);
                } else {
                    toast.error(error.response.data.detail || 'Failed to update profile');
                }
            } else {
                toast.error('Failed to update profile');
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
                <div className="text-lg text-gray-500">Loading profile...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
                <div className="text-lg text-red-500">Failed to load profile.</div>
            </div>
        );
    }

    const formatRole = (role) => {
        return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
                <p className="text-sm mt-2 text-gray-500">Manage your personal information and account settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Overview Card */}
                <div className="lg:col-span-1">
                    <Card className="p-6 md:p-8 flex flex-col items-center">
                        <div className="h-28 w-28 rounded-full bg-blue-100 flex items-center justify-center mb-6 shadow-inner">
                            <UserIcon className="h-14 w-14 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 text-center">{user.name || 'Set your name'}</h3>
                        <p className="text-gray-500 mt-1 mb-6 text-center">{formatRole(user.role)}</p>

                        <div className="w-full space-y-4">
                            <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                                <Phone className="h-5 w-5 text-gray-400" />
                                <span className="text-gray-700 font-medium">{user.mobile}</span>
                            </div>
                            <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                                <Shield className="h-5 w-5 text-gray-400" />
                                <span className={`text-sm font-bold uppercase tracking-wider ${user.is_active ? 'text-green-600' : 'text-red-500'}`}>
                                    {user.is_active ? 'Active Account' : 'Inactive Account'}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2">
                    <Card className="p-6 md:p-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Personal Details</h3>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-semibold text-gray-700 block">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                            placeholder="Enter your full name"
                                            required
                                            minLength={2}
                                        />
                                    </div>
                                </div>

                                {/* Email Input */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-semibold text-gray-700 block">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Read-only fields layout matching */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-500 block">Mobile Number (Non-editable)</label>
                                    <input
                                        type="text"
                                        value={user.mobile}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-500 block">Role (Non-editable)</label>
                                    <input
                                        type="text"
                                        value={formatRole(user.role)}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving || (name === user.name && email === user.email)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isSaving || (name === user.name && email === user.email)
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                                        }`}
                                >
                                    <Save className="h-5 w-5" />
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
