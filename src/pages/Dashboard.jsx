import React, { useState, useEffect } from 'react';
import { Bell, Menu } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import { sensorWebSocket } from '../api/websocket';

import Sidebar from '../components/Sidebar';
import NotificationSidebar from '../components/NotificationSidebar';
import HomePage from './HomePage';
import PatientListPage from './PatientListPage';
import AddWardPage from './AddWardPage';
import ManageStaffPage from './ManageStaffPage';
import HistoryPage from './HistoryPage';
import SendNotificationPage from './SendNotificationPage';
import ProfilePage from './ProfilePage';

import 'react-toastify/dist/ReactToastify.css';

const Dashboard = ({ role, onLogout }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileNotificationsOpen, setIsMobileNotificationsOpen] = useState(false);

  // Establish a single shared WebSocket connection for the whole dashboard.
  // All child components (HomePage, NotificationSidebar) share this one socket.
  useEffect(() => {
    sensorWebSocket.connect();
    return () => {
      sensorWebSocket.disconnect();
    };
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <HomePage />;
      case 'patient-list':
        return <PatientListPage />;
      case 'add-ward':
        return <AddWardPage />;
      case 'manage-staff':
        return <ManageStaffPage />;
      case 'send-notification':
        return <SendNotificationPage role={role} />;
      case 'history':
        return <HistoryPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100/30">
      <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm md:hidden">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 -ml-2 text-gray-600 hover:text-blue-600 focus:outline-none"
        >
          <Menu size={24} />
        </button>

        <span className="text-lg font-bold text-blue-600">fluidCare</span>

        <button
          onClick={() => setIsMobileNotificationsOpen(true)}
          className="relative p-2 -mr-2 text-gray-600 hover:text-blue-600 focus:outline-none"
        >
          <Bell size={24} />
          <span className="absolute right-2.5 top-2 h-2 w-2 bg-red-500"></span>
        </button>
      </div>

      <Sidebar
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section);
          setIsMobileSidebarOpen(false);
        }}
        hospitalName="fluidCare"
        username="U"
        role={role}
        onLogout={onLogout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto pt-14 md:pt-0">
        {renderContent()}
      </div>

      <NotificationSidebar
        isMobileOpen={isMobileNotificationsOpen}
        onCloseMobile={() => setIsMobileNotificationsOpen(false)}
      />

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default Dashboard;
