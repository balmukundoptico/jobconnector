// frontend/src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { requestOTP, verifyOTP } from '../utils/api';

const Register = () => {
  const navigate = useNavigate();
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [role, setRole] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [serverOtp, setServerOtp] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!contact) {
      setMessage('Please enter a WhatsApp number or email');
      return;
    }
    if (!role) {
      setMessage('Please select a role');
      return;
    }
    try {
      const isEmail = contact.includes('@');
      const payload = isEmail ? { email: contact, role, loginRequest: false } : { whatsappNumber: contact, role, loginRequest: false };
      const response = await requestOTP(payload);
      setServerOtp(response.data.serverOtp);
      setMessage(response.data.message);
      setOtpSent(true);
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
        serverOtp,
        role,
        bypass: false,
      };
      const response = await verifyOTP(payload);
      setMessage(response.data.message);

      if (response.data.message === 'OTP verification successful') {
        navigate(`/${role}-profile`, { state: { contact, isEmail } });
      }
    } catch (error) {
      console.error('OTP Verify Error:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Error verifying OTP');
    }
  };

  const handleCheckUser = async () => {
    if (!contact) {
      setMessage('Please enter a WhatsApp number or email');
      return;
    }
    if (!role) {
      setMessage('Please select a role');
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
      if (response.data.isNewUser) {
        await handleRequestOTP({ preventDefault: () => {} });
      } else {
        setMessage('Profile or account exists. Redirecting to login...');
        setTimeout(() => navigate('/auth/' + role), 2000);
      }
    } catch (error) {
      console.error('Error checking user:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Error checking user existence');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Register as Job Seeker or Job Provider
          </h2>
          <form onSubmit={otpSent ? handleVerifyOTP : handleRequestOTP} className="space-y-4">
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="WhatsApp number or email"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              disabled={otpSent}
            />
            <div className="flex space-x-4 justify-center">
              <button
                type="button"
                onClick={() => setRole('seeker')}
                className={`px-4 py-2 rounded ${role === 'seeker' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
              >
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => setRole('provider')}
                className={`px-4 py-2 rounded ${role === 'provider' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
              >
                Job Provider
              </button>
            </div>
            {!otpSent ? (
              <button
                type="button"
                onClick={handleCheckUser}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Register
              </button>
            ) : (
              <>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                >
                  Verify OTP
                </button>
              </>
            )}
          </form>
          {message && (
            <p className="text-gray-600 dark:text-gray-300">{message}</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;