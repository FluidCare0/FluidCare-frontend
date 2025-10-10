import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import NotificationSidebar from '../components/NotificationSidebar';
import HomePage from './HomePage';
import PatientListPage from './PatientListPage';
import AddWardPage from './AddWardPage';
import AnalyticsPage from './AnalyticsPage';
import ManageStaffPage from './ManageStaffPage';
import HistoryPage from './HistoryPage';

// Main Dashboard Component
const Dashboard = ({ onLogout }) => {
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
      {/* Left Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        hospitalName="fluidCare"
        username="U"
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>

      {/* Right Permanent Notification Sidebar */}
      <NotificationSidebar />
    </div>
  );
};

export default Dashboard;