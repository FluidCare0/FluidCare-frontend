import React, { useMemo, useState } from 'react';
import { Droplets, Home, Users, PlusCircle, UserCog, History, Send, LogOut, ChevronLeft, ChevronRight, X, User } from 'lucide-react';
import NavButton from './NavButton';

const Sidebar = ({ activeSection, onSectionChange, hospitalName, username, role, onLogout, isMobileOpen, onCloseMobile }) => {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navigationItems = useMemo(() => {
        const items = [
            { id: 'home', label: 'Home', icon: Home },
            { id: 'patient-list', label: 'Patient List', icon: Users },
            { id: 'add-ward', label: 'Add Ward', icon: PlusCircle },
            { id: 'manage-staff', label: 'Manage Staff', icon: UserCog },
            { id: 'history', label: 'History', icon: History },
            { id: 'profile', label: 'My Profile', icon: User },
        ];
        if (role === 'root_admin' || role === 'manager') {
            items.push({
                id: 'send-notification',
                label: 'Send Notification',
                icon: Send
            });
        }
        return items;
    }, [role]);

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
            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity backdrop-blur-sm"
                    onClick={onCloseMobile}
                />
            )}

            {/* Main Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-40 transform md:relative md:translate-x-0 h-screen bg-white border-r border-gray-200 flex flex-col shadow-2xl md:shadow-none transition-all duration-300 ease-in-out
                ${isCollapsed ? 'w-20' : 'w-full max-w-[320px] sm:w-80'}
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Desktop Header */}
                <div className="hidden md:block p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-200">
                                <Droplets className="text-white" size={22} strokeWidth={2.5} />
                            </div>
                            {!isCollapsed && (
                                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 truncate">
                                    fluid<span className="text-blue-600">Care</span>
                                </h1>
                            )}
                        </div>
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        >
                            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Header */}
                <div className="md:hidden p-4 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-md">
                            <Droplets className="text-white" size={18} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-lg font-bold text-slate-900">
                            fluid<span className="text-blue-600">Care</span>
                        </h1>
                    </div>
                    <button onClick={onCloseMobile} className="p-2 text-slate-500 hover:text-slate-900">
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {navigationItems.map((item) => (
                        <NavButton
                            key={item.id}
                            active={activeSection === item.id}
                            onClick={() => {
                                onSectionChange(item.id);
                                if (isMobileOpen) onCloseMobile();
                            }}
                            isCollapsed={isCollapsed}
                            icon={item.icon}
                        >
                            {item.label}
                        </NavButton>
                    ))}
                </nav>

                {/* Footer Section */}
                <div className="p-4 border-t border-gray-100 bg-slate-50/50">
                    <button
                        onClick={handleLogoutClick}
                        className={`w-full flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-red-600 shadow-sm transition-all hover:border-red-100 hover:bg-red-50 hover:shadow-md ${isCollapsed ? 'justify-center p-3' : ''}`}
                    >
                        <LogOut size={22} strokeWidth={2} />
                        {!isCollapsed && <span className="font-bold text-sm">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Logout Confirmation */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 transform transition-all animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Logout</h3>
                        <p className="text-slate-500 mb-8">Are you sure you want to end your session?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelLogout}
                                className="flex-1 bg-slate-100 px-4 py-3 rounded-xl text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 bg-red-600 px-4 py-3 rounded-xl text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-colors"
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
