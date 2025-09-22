import React, { useState, useEffect } from 'react';
import api from '../api/api';
import CompleteProfile from './CompleteProfile';

function Dashboard({ role, onLogin }) {
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trialMessage, setTrialMessage] = useState('');
  const [trialInfo, setTrialInfo] = useState(null);

  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      const userRes = await api.get('auth/user/');
      setUserData(userRes.data);
      
      if (userRes.data.name === 'empty' || !userRes.data.name) {
        setShowCompleteProfile(true);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    try {
      const response = await api.post('auth/start-trial/');
      setTrialMessage(response.data.message);
      setTrialInfo(response.data.data);
    } catch (error) {
      if (error.response) {
        setTrialMessage(error.response.data.message);
        setTrialInfo(error.response.data.data);
      } else {
        setTrialMessage('Something went wrong.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (showCompleteProfile) {
    return <CompleteProfile user={userData} onLogin={onLogin} />;
  }

return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          Welcome to Dashboard 🎉
        </h1>
        <p className="text-lg text-gray-600">
          Hello {userData?.name}! (Role: {role})
        </p>
        <p className="text-lg text-gray-600">
          User ID: {userData.id} <br />
          Mobile: {userData.mobile}
        </p>

        {/* Trial Section */}
        <div className="mt-6">
          {!trialInfo ? (
            <button
              onClick={handleStartTrial}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
            >
              Start Trial
            </button>
          ) : (
            <div className="text-gray-700">
              <p className="font-medium">{trialMessage}</p>
              <p>
                Trial Start: {new Date(trialInfo.trial_start).toLocaleString()}
              </p>
              <p>Trial End: {new Date(trialInfo.trial_end).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;