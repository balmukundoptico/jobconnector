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
    hrWhatsappNumber: state?.isEmail ? '' : state?.contact || '',
    email: state?.isEmail ? state?.contact || '' : '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createProviderProfile(formData);
      navigate('/provider-dashboard', { state: { user: response.data.provider } });
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Error creating profile');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Create Job Provider Profile</h2>
          <input name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Company Name" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required />
          <input name="hrName" value={formData.hrName} onChange={handleChange} placeholder="HR Name" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required />
          <input name="hrWhatsappNumber" value={formData.hrWhatsappNumber} onChange={handleChange} placeholder="HR WhatsApp Number" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
          <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Save Profile</button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default ProviderProfile;