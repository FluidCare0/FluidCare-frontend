import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import PatientListPage from './pages/PatientListPage';
import AddWardPage from './pages/AddWardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ManageStaffPage from './pages/ManageStaffPage';
import HistoryPage from './pages/HistoryPage';

// Main Dashboard Component
const Dashboard = () => {
    const [activeSection, setActiveSection] = useState('home');

    const renderContent = () => {
        switch (activeSection) {
            case 'home':
                return <HomePage />;
            case 'patient-list':
                return <PatientListPage />;
            case 'add-ward':
                return <AddWardPage />;
            case 'analytics':
                return <AnalyticsPage />;
            case 'manage-staff':
                return <ManageStaffPage />;
            case 'history':
                return <HistoryPage />;
            default:
                return <HomePage />;
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
            {/* Sidebar */}
            <Sidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                hospitalName="fluidCare"
                username="U"
            />

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default Dashboard;