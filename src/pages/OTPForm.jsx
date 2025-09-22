import React, { useState } from 'react';
import api from '../api/api';
import CompleteProfile from './CompleteProfile';

function OTPForm({ mobile, onLogin }) {
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('verify');
  const [userData, setUserData] = useState(null);

  const verifyOTP = async () => {
    try {
      const res = await api.post('auth/verify-otp/', { mobile, otp });
      localStorage.setItem('access', res.data.access);

      if (res.data.needs_profile_completion) {
        setUserData(res.data.user);
        setStep('complete-profile');
      } else {
        onLogin(res.data.user.role);
      }
    } catch {
      alert('Invalid or expired OTP');
    }
  };

  if (step === 'complete-profile') {
    return <CompleteProfile user={userData} onLogin={onLogin} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-semibold mb-4">Enter OTP sent to {mobile}</h2>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg"
        />
        <button
          onClick={verifyOTP}
          className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Verify OTP
        </button>
      </div>
    </div>
  );
}

export default OTPForm;