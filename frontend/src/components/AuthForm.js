// frontend/src/components/AuthForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestOTP, verifyOTP } from '../utils/api';

const AuthForm = ({ role }) => {
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const [serverOtp, setServerOtp] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!contact) {
      setMessage('Please enter a WhatsApp number or email');
      return;
    }
    try {
      const isEmail = contact.includes('@');
      const payload = isEmail ? { email: contact, role, loginRequest: true } : { whatsappNumber: contact, role, loginRequest: true };
      const response = await requestOTP(payload);
      setServerOtp(response.data.serverOtp);
      setMessage(response.data.message);
      setOtpSent(true);
    } catch (error) {
      console.error('OTP Request Error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Error sending OTP';
      setMessage(errorMessage);
      if (error.response?.status === 404 && errorMessage === 'User not found, please register first') {
        setTimeout(() => navigate('/register'), 2000);
      }
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      const isEmail = contact.includes('@');
      const payload = {
        ...(isEmail ? { email: contact } : { whatsappNumber: contact }),
        otp,
        serverOtp,
        role,
        bypass: false,
      };
      const response = await verifyOTP(payload);
      setMessage(response.data.message);

      if (response.data.message === 'OTP verification successful') {
        if (response.data.isNewUser) {
          navigate(`/${role}-profile`, { state: { contact, isEmail } });
        } else {
          navigate(`/${role}-dashboard`, { state: { user: response.data.user, contact } });
        }
      }
    } catch (error) {
      console.error('OTP Verify Error:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Error verifying OTP');
    }
  };

  const handleBypassOTP = async () => {
    if (!contact) {
      setMessage('Please enter a WhatsApp number or email');
      return;
    }
    try {
      const isEmail = contact.includes('@');
      const payload = {
        ...(isEmail ? { email: contact } : { whatsappNumber: contact }),
        otp: 'bypass',
        role,
        bypass: true,
      };
      const response = await verifyOTP(payload);
      setMessage(response.data.message);

      if (role === 'seeker') {
        if (response.data.isNewUser) {
          console.log('New seeker, redirecting to profile creation');
          navigate('/seeker-profile', { state: { contact, isEmail } });
        } else {
          console.log('Existing seeker, redirecting to dashboard');
          navigate('/seeker-dashboard', { state: { user: response.data.user, contact } });
        }
      } else if (role === 'provider') {
        if (response.data.isNewUser) {
          console.log('New provider, redirecting to profile creation');
          navigate('/provider-profile', { state: { contact, isEmail } });
        } else {
          console.log('Existing provider, redirecting to dashboard');
          navigate('/provider-dashboard', { state: { user: response.data.user, contact } });
        }
      } else if (role === 'admin') {
        if (response.data.isNewUser) {
          console.log('New admin, no profile creation yet');
          setMessage('Admin creation not supported yet');
        } else {
          console.log('Existing admin, redirecting to dashboard');
          navigate('/admin-dashboard', { state: { user: response.data.user, contact } });
        }
      }
    } catch (error) {
      console.error('Bypass OTP Error:', error.message);
      setMessage('Error bypassing OTP. Please try again or check server connection.');
      if (error.message.includes('Network Error')) {
        setTimeout(() => navigate('/register'), 2000); // Redirect to register on network error
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
        {role === 'seeker' ? 'Job Seeker' : role === 'provider' ? 'Job Provider' : 'Admin'} Login
      </h2>
      <form onSubmit={otpSent ? handleVerifyOTP : handleRequestOTP} className="space-y-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-300">WhatsApp or Email</label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            placeholder="Enter WhatsApp number or email"
            disabled={otpSent}
          />
        </div>
        {otpSent && (
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              placeholder="Enter OTP"
            />
          </div>
        )}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {otpSent ? 'Verify OTP' : 'Get OTP'}
          </button>
          <button
            type="button"
            onClick={handleBypassOTP}
            className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            Bypass OTP
          </button>
        </div>
        {message && (
          <p className="text-center text-gray-600 dark:text-gray-300">{message}</p>
        )}
      </form>
    </div>
  );
};

export default AuthForm;