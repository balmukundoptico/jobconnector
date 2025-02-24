// frontend/src/pages/ProviderProfile.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { createProviderProfile } from '../utils/api';

const ProviderProfile = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    hrName: '',
    hrWhatsappNumber: state?.contact && !state?.isEmail ? state.contact : '',
    email: state?.contact && state?.isEmail ? state.contact : '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting provider formData:', formData); // Debug log
    try {
      const response = await createProviderProfile(formData);
      console.log('Profile creation response:', response.data); // Debug log
      setMessage(response.data.message);
      // Redirect to ProviderDashboard with user data
      navigate('/provider-dashboard', { 
        state: { 
          user: response.data.user, 
          contact: formData.hrWhatsappNumber || formData.email 
        } 
      });
    } catch (error) {
      console.error('Error creating provider profile:', error);
      setMessage(error.response?.data?.message || 'Error creating provider profile');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Create Provider Profile
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-900 dark:text-gray-100">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Enter company name"
                required
              />
            </div>
            <div>
              <label className="block text-gray-900 dark:text-gray-100">HR Name</label>
              <input
                type="text"
                name="hrName"
                value={formData.hrName}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Enter HR name"
                required
              />
            </div>
            <div>
              <label className="block text-gray-900 dark:text-gray-100">HR WhatsApp Number</label>
              <input
                type="text"
                name="hrWhatsappNumber"
                value={formData.hrWhatsappNumber}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Enter HR WhatsApp number"
              />
            </div>
            <div>
              <label className="block text-gray-900 dark:text-gray-100">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Enter email"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Save Profile
            </button>
          </form>
          {message && (
            <p className="text-gray-900 dark:text-gray-100 mt-2 text-center">{message}</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProviderProfile;