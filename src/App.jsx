import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import OTPForm from './pages/OTPForm';
import Dashboard from './pages/Dashboard';
import api from './api/api';
import { useTokenMonitor } from './hooks/useTokenMonitor';

function App() {
  const [step, setStep] = useState('loading');
  const [mobile, setMobile] = useState('');
  const [userRole, setUserRole] = useState(null);

  useTokenMonitor();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('access');
    if (!token) {
      setStep('login');
      return;
    }

    try {
      const userRes = await api.get('auth/user/');
      setUserRole(userRes.data.role);
      setStep('dashboard');
    } catch (error) {
      try {
        const refreshRes = await api.post('auth/refresh/');
        localStorage.setItem('access', refreshRes.data.access);
        
        const userRes = await api.get('auth/user/');
        setUserRole(userRes.data.role);
        setStep('dashboard');
      } catch (refreshError) {
        localStorage.removeItem('access');
        setStep('login');
      }
    }
  };

  const handleOTPSent = (mobileNumber) => {
    setMobile(mobileNumber);
    setStep('otp');
  };

  const handleLogin = (role) => {
    setUserRole(role);
    setStep('dashboard');
  };

  const handleLogout = async () => {
    try {
      await api.post('auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('access');
    setUserRole(null);
    setMobile('');
    setStep('login');
  };

  if (step === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (step === 'login') {
    return <Login onOTPSent={handleOTPSent} />;
  }

  if (step === 'otp') {
    return <OTPForm mobile={mobile} onLogin={handleLogin} />;
  }

  if (step === 'dashboard') {
    return (
      <div>
        <nav className="bg-white shadow-sm p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-semibold">My App</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </nav>
        <Dashboard role={userRole} onLogin={handleLogin} />
      </div>
    );
  }

  return null;
}

export default App;