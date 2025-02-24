// frontend/src/pages/AdminAuth.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { requestOTP, verifyOTP } from '../utils/api';

const AdminAuth = () => {
  const navigate = useNavigate();
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!contact) {
      setMessage('Please enter a WhatsApp number or email');
      return;
    }
    try {
      const isEmail = contact.includes('@');
      const payload = isEmail ? { email: contact, role: 'admin' } : { whatsappNumber: contact, role: 'admin' };
      const response = await requestOTP(payload);
      console.log('OTP for testing:', response.data.otp); // Log OTP for testing
      setMessage(response.data.message);
      setOtpSent(true); // Show OTP input field
    } catch (error) {
      console.error('OTP Request Error:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Error sending OTP');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      const isEmail = contact.includes('@');
      const payload = {
        ...(isEmail ? { email: contact } : { whatsappNumber: contact }),
        otp,
        role: 'admin',
        bypass: false,
      };
      const response = await verifyOTP(payload);
      setMessage(response.data.message);
      navigate('/admin-dashboard', { state: { user: response.data.user, contact } });
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
        role: 'admin',
        bypass: true,
      };
      const response = await verifyOTP(payload);
      console.log('Bypass Response:', response.data); // Debug log
      setMessage(response.data.message);

      if (response.data.isNewUser) {
        setMessage('Admin creation not supported yet. Please use an existing admin account.');
      } else {
        navigate('/admin-dashboard', { state: { user: response.data.user, contact } });
      }
    } catch (error) {
      console.error('Bypass OTP Error:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Error bypassing OTP');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Admin Login
          </h2>
          <form onSubmit={otpSent ? handleVerifyOTP : handleRequestOTP} className="space-y-4">
            <div>
              <label className="block text-gray-900 dark:text-gray-100">WhatsApp or Email</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Enter WhatsApp number or email"
                disabled={otpSent}
              />
            </div>
            {otpSent && (
              <div>
                <label className="block text-gray-900 dark:text-gray-100">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="Enter OTP (check console)"
                />
              </div>
            )}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
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
              <p className="text-gray-900 dark:text-gray-100 mt-2 text-center">{message}</p>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminAuth;