// frontend/src/pages/SeekerProfile.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { createSeekerProfile } from '../utils/api';

const SeekerProfile = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    whatsappNumber: state?.contact && !state?.isEmail ? state.contact : '',
    email: state?.contact && state?.isEmail ? state.contact : '',
    skillType: 'IT',
    skills: '',
    experience: '',
    location: '',
    currentCTC: '',
    expectedCTC: '',
    noticePeriod: '',
    lastWorkingDate: '',
    resume: '',
    bio: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting formData:', formData); // Debug log
    try {
      const response = await createSeekerProfile(formData);
      setMessage(response.data.message);
      navigate('/seeker-dashboard', { state: { user: response.data.user, contact: formData.whatsappNumber || formData.email } });
    } catch (error) {
      console.error('Error creating profile:', error);
      setMessage(error.response?.data?.message || 'Error creating seeker profile');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Create Seeker Profile
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-900 dark:text-gray-100">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Enter full name"
                required
              />
            </div>
            <div>
              <label className="block text-gray-900 dark:text-gray-100">WhatsApp Number</label>
              <input
                type="text"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Enter WhatsApp number"
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
            <div>
              <label className="block text-gray-900 dark:text-gray-100">Skill Type</label>
              <select
                name="skillType"
                value={formData.skillType}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              >
                <option value="IT">IT</option>
                <option value="Non-IT">Non-IT</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-900 dark:text-gray-100">Skills</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Enter skills (comma-separated)"
              />
            </div>
            <div>
              <label className="block text-gray-900 dark:text-gray-100">Experience (years)</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Enter experience"
              />
            </div>
            <div>
              <label className="block text-gray-900 dark:text-gray-100">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Enter location"
              />
            </div>
            <div>
              <label className="block text-gray-900 dark:text-gray-100">Current CTC</label>
              <input
                type="number"
                name="currentCTC"
                value={formData.currentCTC}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Enter current CTC"
              />
            </div>
            <div>
              <label className="block text-gray-900 dark:text-gray-100">Expected CTC</label>
              <input
                type="number"
                name="expectedCTC"
                value={formData.expectedCTC}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Enter expected CTC"
              />
            </div>
            <div>
              <label className="block text-gray-900 dark:text-gray-100">Notice Period</label>
              <input
                type="text"
                name="noticePeriod"
                value={formData.noticePeriod}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Enter notice period"
              />
            </div>
            <div>
              <label className="block text-gray-900 dark:text-gray-100">Last Working Date</label>
              <input
                type="date"
                name="lastWorkingDate"
                value={formData.lastWorkingDate}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-gray-900 dark:text-gray-100">Resume URL</label>
              <input
                type="text"
                name="resume"
                value={formData.resume}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Enter resume URL"
              />
            </div>
            <div>
              <label className="block text-gray-900 dark:text-gray-100">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Enter bio"
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

export default SeekerProfile;