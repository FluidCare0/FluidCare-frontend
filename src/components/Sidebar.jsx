import React, { useState } from 'react';
import NavButton from './NavButton';

const Sidebar = ({ activeSection, onSectionChange, hospitalName, username, onLogout }) => {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigationItems = [
        { id: 'home', label: 'Home' },
        { id: 'patient-list', label: 'Patient list' },
        { id: 'add-ward', label: 'Add Ward' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'manage-staff', label: 'Manage Staff' },
        { id: 'history', label: 'History' }
    ];

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        onLogout();
        setShowLogoutConfirm(false);
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
            {/* Hospital Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-blue-600">{hospitalName}</h1>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-300">
                        <span className="text-sm font-semibold text-blue-600">{username}</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navigationItems.map((item) => (
                    <NavButton
                        key={item.id}
                        active={activeSection === item.id}
                        onClick={() => onSectionChange(item.id)}
                    >
                        {item.label}
                    </NavButton>
                ))}
            </nav>

            {/* Logout Button at the bottom */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white hover:bg-red-50 transition-colors border border-gray-200 text-red-600"
                >
                    <div className="w-6 h-6 rounded-full border-2 border-red-300"></div>
                    <span className="font-medium">Logout</span>
                </button>
            </div>

            {/* Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Logout</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelLogout}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;