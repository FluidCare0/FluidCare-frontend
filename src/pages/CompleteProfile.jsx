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
      // Update user profile using the correct endpoint
      await api.put('auth/profile-info/', { name, email });
      
      // Get updated user data
      const userRes = await api.get('auth/user/');
      onLogin(userRes.data.role);
    } catch (error) {
      alert('Failed to save profile: ' + (error.response?.data?.detail || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-semibold mb-4">Complete Your Profile</h2>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg"
          required
        />
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg"
          required
        />
        <button
          onClick={saveProfile}
          disabled={loading}
          className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
}

export default CompleteProfile;