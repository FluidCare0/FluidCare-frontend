import React, { useState } from 'react';
import NavButton from './NavButton';

const Sidebar = ({ activeSection, onSectionChange, hospitalName, username, onLogout }) => {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigationItems = [
        { id: 'home', label: 'Home', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
        { id: 'patient-list', label: 'Patient list', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
        { id: 'add-ward', label: 'Add Ward', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
        { id: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { id: 'manage-staff', label: 'Manage Staff', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
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
        <>
            {/* Main Sidebar */}
            <div className={`bg-white border-r border-gray-200 flex flex-col shadow-sm transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-80'}`}>
                {/* Hospital Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-300">
                                <span className="text-sm font-semibold text-blue-600">{username}</span>
                            </div>
                            {!isCollapsed && (
                                <h1 className="text-xl font-bold text-blue-600">{hospitalName}</h1>
                            )}
                        </div>
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-1 rounded-lg hover:bg-gray-100"
                        >
                            <svg
                                className="w-5 h-5 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navigationItems.map((item) => (
                        <NavButton
                            key={item.id}
                            active={activeSection === item.id}
                            onClick={() => onSectionChange(item.id)}
                            isCollapsed={isCollapsed}
                            icon={item.icon}
                        >
                            {item.label}
                        </NavButton>
                    ))}
                </nav>

                {/* Logout Button at the bottom */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogoutClick}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white hover:bg-red-50 transition-colors border border-gray-200 text-red-600 ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {!isCollapsed && <span className="font-medium">Logout</span>}
                    </button>
                </div>
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
        </>
    );
};

export default Sidebar;