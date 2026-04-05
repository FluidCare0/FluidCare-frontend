import React, { useState } from 'react';

import api from '../api/api';

function CompleteProfile({ user, onLogin }) {
    const [name, setName] = useState(user?.name === 'empty' ? '' : (user?.name || ''));
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);

    const saveProfile = async () => {
        if (!name || !email) {
            alert('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            await api.put('auth/profile-info/', { name, email });
            const userRes = await api.get('auth/user/');
            onLogin(userRes.data.role);
        } catch (error) {
            alert(`Failed to save profile: ${error.response?.data?.detail || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="absolute inset-0 z-0">
                <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse bg-blue-100 opacity-30 mix-blend-multiply blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 h-72 w-72 animate-pulse bg-indigo-100 opacity-30 mix-blend-multiply blur-3xl delay-700"></div>
            </div>

            <div className="relative z-10 w-full max-w-md bg-white p-6 shadow-2xl md:p-8">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 rotate-3 items-center justify-center bg-blue-100 text-blue-600 shadow-lg">
                        <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
                    <p className="mt-2 text-gray-500">Just a few more details to get started</p>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">Full Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Dr. John Watson"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-200 bg-gray-50/50 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">Email Address</label>
                        <input
                            type="email"
                            placeholder="name@hospital.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-200 bg-gray-50/50 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <button
                        onClick={saveProfile}
                        disabled={loading || !name || !email}
                        className={`flex w-full items-center justify-center gap-2 px-6 py-3.5 font-bold transition-all active:scale-[0.98] ${
                            loading || !name || !email
                                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                : 'bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? (
                            <div className="h-5 w-5 animate-spin border-2 border-white/30 border-t-white"></div>
                        ) : (
                            'Save & Continue'
                        )}
                        {!loading && (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CompleteProfile;
