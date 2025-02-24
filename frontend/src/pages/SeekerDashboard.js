// frontend/src/pages/SeekerDashboard.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getProfile, searchJobs, getTrendingSkills } from '../utils/api';

const SeekerDashboard = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(state?.user || null);
  const [searchForm, setSearchForm] = useState({ skills: '', experience: '', location: '', filters: [] });
  const [jobs, setJobs] = useState([]);
  const [trendingSkills, setTrendingSkills] = useState([]);
  const [showPrompt, setShowPrompt] = useState(false);

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
    const fetchTrendingSkills = async () => {
      try {
        const response = await getTrendingSkills();
        setTrendingSkills(response.data);
      } catch (error) {
        console.error('Error fetching trending skills:', error);
      }
    };
    fetchTrendingSkills();
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
            <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base"><strong>Name:</strong> {user.fullName}</p>
            <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base"><strong>WhatsApp:</strong> {user.whatsappNumber || 'N/A'}</p>
            <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base"><strong>Email:</strong> {user.email || 'N/A'}</p>
            <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base"><strong>Skills:</strong> {user.skills?.join(', ') || 'N/A'}</p>
            <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base"><strong>Experience:</strong> {user.experience || 0} years</p>
            <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base"><strong>Location:</strong> {user.location || 'N/A'}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Trending Skills</h3>
            {trendingSkills.length > 0 ? (
              <ul className="list-disc pl-5 text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                {trendingSkills.map((skill, index) => (
                  <li key={index}>{skill.skill} ({skill.count} jobs)</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">No trending skills available</p>
            )}
          </div>
          <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Search Jobs</h3>
            <input name="skills" value={searchForm.skills} onChange={handleChange} placeholder="Skills (comma-separated)" className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base" />
            <input name="experience" type="number" value={searchForm.experience} onChange={handleChange} placeholder="Max Experience (years)" className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base" />
            <input name="location" value={searchForm.location} onChange={handleChange} placeholder="Location" className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base" />
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
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Search</button>
          </form>
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SeekerDashboard;