// frontend/src/pages/SeekerDashboard.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getProfile, searchJobs, updateSeekerProfile, saveSearch } from '../utils/api';

const SeekerDashboard = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(state?.user || null);
  const [searchForm, setSearchForm] = useState({
    skills: '',
    experience: '',
    location: '',
    minCTC: '',
    maxCTC: '',
    noticePeriod: '',
    filters: [],
  });
  const [jobs, setJobs] = useState([]);
  const [showPrompt, setShowPrompt] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [notification, setNotification] = useState('');
  const [savedSearches, setSavedSearches] = useState([]);

  useEffect(() => {
    if (!state?.user && !state?.contact) {
      navigate('/auth/seeker');
    } else if (!user && state?.contact) {
      const fetchProfile = async () => {
        try {
          const isEmail = state.contact.includes('@');
          const response = await getProfile({
            role: 'seeker',
            ...(isEmail ? { email: state.contact } : { whatsappNumber: state.contact }),
          });
          if (!response.data || !response.data.fullName) {
            navigate('/seeker-profile', { state: { contact: state.contact, isEmail } });
          } else {
            setUser(response.data);
            setEditForm(response.data);
            if (!response.data.skills || !response.data.experience) {
              setShowPrompt(true);
            }
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          navigate('/auth/seeker');
        }
      };
      fetchProfile();
    }
  }, [user, state, navigate]);

  const handleChange = (e) => {
    setSearchForm({ ...searchForm, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (filter) => {
    setSearchForm(prev => ({
      ...prev,
      filters: prev.filters.includes(filter)
        ? prev.filters.filter(f => f !== filter)
        : [...prev.filters, filter],
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await searchJobs({ ...searchForm, filters: searchForm.filters.join(',') });
      setJobs(response.data);
    } catch (error) {
      console.error('Error searching jobs:', error);
      setJobs([]);
    }
  };

  const handleSaveSearch = async () => {
    try {
      const response = await saveSearch({ userId: user._id, role: 'seeker', searchCriteria: searchForm });
      console.log('Save search response:', response.data);
      setSavedSearches(prev => {
        const updatedSearches = [...prev, response.data];
        console.log('Updated savedSearches:', updatedSearches);
        return updatedSearches;
      });
      setNotification('Search saved successfully');
      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      console.error('Error saving search:', error);
      setNotification('Error saving search');
    }
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      const response = await updateSeekerProfile({ ...editForm, _id: user._id });
      setUser(response.data.user);
      setEditMode(false);
      setNotification('Profile updated successfully');
      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification('Error updating profile');
    }
  };

  const handleWhatsAppConnect = (job) => {
    setAppliedJobs(prev => [...prev, { jobId: job._id, title: job.jobTitle, status: 'Sent' }]);
    setNotification(`Connected via WhatsApp for ${job.jobTitle}`);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleCompleteProfile = () => {
    navigate('/seeker-profile', { state: { contact: state.contact, isEmail: state.contact.includes('@') } });
  };

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="flex-grow p-4 sm:p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center sm:text-left">
          Job Seeker Dashboard
        </h2>
        {notification && (
          <div className="fixed top-4 right-4 bg-green-500 text-white p-2 rounded shadow-md">
            {notification}
          </div>
        )}
        <div className="space-y-6 max-w-4xl mx-auto">
          {showPrompt && (
            <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg shadow-md border border-yellow-200 dark:border-yellow-800 mb-4">
              <p className="text-yellow-800 dark:text-yellow-100 text-sm sm:text-base">
                Your profile is incomplete. Please complete it to improve your job matches.
              </p>
              <button
                onClick={handleCompleteProfile}
                className="mt-2 bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 w-full sm:w-auto"
              >
                Complete Profile
              </button>
            </div>
          )}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            {editMode ? (
              <div className="space-y-4">
                <input
                  name="fullName"
                  value={editForm.fullName || ''}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="Full Name"
                />
                <input
                  name="whatsappNumber"
                  value={editForm.whatsappNumber || ''}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="WhatsApp Number"
                />
                <input
                  name="email"
                  value={editForm.email || ''}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="Email"
                />
                <input
                  name="skills"
                  value={editForm.skills?.join(', ') || ''}
                  onChange={(e) => setEditForm({ ...editForm, skills: e.target.value.split(', ') })}
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="Skills (comma-separated)"
                />
                <input
                  name="experience"
                  type="number"
                  value={editForm.experience || 0}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="Experience (years)"
                />
                <input
                  name="location"
                  value={editForm.location || ''}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="Location"
                />
                <button
                  onClick={handleSaveProfile}
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Save Profile
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base"><strong>Name:</strong> {user.fullName}</p>
                <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base"><strong>WhatsApp:</strong> {user.whatsappNumber || 'N/A'}</p>
                <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base"><strong>Email:</strong> {user.email || 'N/A'}</p>
                <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base"><strong>Skills:</strong> {user.skills?.join(', ') || 'N/A'}</p>
                <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base"><strong>Experience:</strong> {user.experience || 0} years</p>
                <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base"><strong>Location:</strong> {user.location || 'N/A'}</p>
                <button
                  onClick={() => setEditMode(true)}
                  className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
          <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Search Jobs</h3>
            <input
              name="skills"
              value={searchForm.skills}
              onChange={handleChange}
              placeholder="Skills (comma-separated)"
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
            />
            <input
              name="experience"
              type="number"
              value={searchForm.experience}
              onChange={handleChange}
              placeholder="Max Experience (years)"
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
            />
            <input
              name="location"
              value={searchForm.location}
              onChange={handleChange}
              placeholder="Location"
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
            />
            <input
              name="minCTC"
              type="number"
              value={searchForm.minCTC}
              onChange={handleChange}
              placeholder="Min CTC"
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
            />
            <input
              name="maxCTC"
              type="number"
              value={searchForm.maxCTC}
              onChange={handleChange}
              placeholder="Max CTC"
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
            />
            <input
              name="noticePeriod"
              value={searchForm.noticePeriod}
              onChange={handleChange}
              placeholder="Notice Period (e.g., 30 days)"
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
            />
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <label className="flex items-center text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                <input
                  type="checkbox"
                  checked={searchForm.filters.includes('viewed')}
                  onChange={() => handleFilterChange('viewed')}
                  className="mr-2"
                />
                Viewed
              </label>
              <label className="flex items-center text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                <input
                  type="checkbox"
                  checked={searchForm.filters.includes('new')}
                  onChange={() => handleFilterChange('new')}
                  className="mr-2"
                />
                New (Last 30 Days)
              </label>
            </div>
            <div className="flex space-x-4">
              <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Search</button>
              <button
                type="button"
                onClick={handleSaveSearch}
                className="w-full bg-teal-500 text-white p-2 rounded hover:bg-teal-600"
              >
                Save Search
              </button>
            </div>
          </form>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Saved Searches</h3>
            {savedSearches.length > 0 ? (
              <ul className="space-y-2">
                {savedSearches.map((search, index) => (
                  <li key={index} className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                    {search && search.searchCriteria ? (
                      `${search.searchCriteria.skills || 'No skills'} - ${search.searchCriteria.location || 'No location'}`
                    ) : (
                      'No search data available'
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">No saved searches yet</p>
            )}
          </div>
          <div className="space-y-4">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <div key={job._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base"><strong>Title:</strong> {job.jobTitle}</p>
                  <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base"><strong>Company:</strong> {job.postedBy.companyName}</p>
                  <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base"><strong>Skills:</strong> {job.skills.join(', ')}</p>
                  <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base"><strong>Experience:</strong> {job.experienceRequired} years</p>
                  <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base"><strong>Location:</strong> {job.location}</p>
                  <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base"><strong>Max CTC:</strong> {job.maxCTC}</p>
                  <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base"><strong>Notice Period:</strong> {job.noticePeriod}</p>
                  <a
                    href={`https://api.whatsapp.com/send?phone=${job.postedBy.hrWhatsappNumber?.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleWhatsAppConnect(job)}
                    className="mt-2 inline-block w-full sm:w-auto bg-green-500 text-white p-2 rounded hover:bg-green-600"
                  >
                    Get Connected on WhatsApp
                  </a>
                </div>
              ))
            ) : (
              <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">No jobs found</p>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Applied Jobs</h3>
            {appliedJobs.length > 0 ? (
              <ul className="space-y-2">
                {appliedJobs.map((applied) => (
                  <li key={applied.jobId} className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                    {applied.title} - Status: {applied.status}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">No jobs applied yet</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SeekerDashboard;