import React, { useState } from 'react';
import api from '../api/api';

function Login({ onOTPSent }) {
  const [mobile, setMobile] = useState('');

  const sendOTP = async () => {
    let formattedMobile = mobile;
    if (!mobile.startsWith('+')) {
      formattedMobile = '+91' + mobile;
    }
    try {
      await api.post('auth/send-otp/', { mobile: formattedMobile });
      onOTPSent(formattedMobile);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to send OTP');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Login with Mobile</h2>
        <input
          type="text"
          placeholder="Enter mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg"
        />
        <button
          onClick={sendOTP}
          className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Send OTP
        </button>
      </div>
    </div>
  );
}

export default Login;
