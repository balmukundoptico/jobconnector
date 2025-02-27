// frontend/src/pages/ProviderDashboard.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getProfile, postJob, searchJobs, updateProviderProfile, sendMassEmail, searchSeekers, saveSearch, getApplicants } from '../utils/api'; // Added getApplicants

const ProviderDashboard = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(state?.user || null);
  const [loading, setLoading] = useState(!state?.user && state?.contact);
  const [jobForm, setJobForm] = useState({
    jobTitle: '',
    skillType: 'IT',
    skills: '',
    experienceRequired: '',
    location: '',
    maxCTC: '',
    noticePeriod: '',
  });
  const [postedJobs, setPostedJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showMassMail, setShowMassMail] = useState(false);
  const [seekers, setSeekers] = useState([]);
  const [selectedSeekers, setSelectedSeekers] = useState([]);
  const [mailForm, setMailForm] = useState({ subject: '', body: '' });
  const [searchSeekerForm, setSearchSeekerForm] = useState({
    skills: '',
    experience: '',
    location: '',
    minCTC: '',
    maxCTC: '',
    filters: [],
  });
  const [searchedSeekers, setSearchedSeekers] = useState([]);
  const [showSearchSeekers, setShowSearchSeekers] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [notification, setNotification] = useState('');
  const [savedSearches, setSavedSearches] = useState([]);
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    if (!state?.contact) {
      navigate('/auth/provider');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (!user) {
          const isEmail = state.contact.includes('@');
          const response = await getProfile({
            role: 'provider',
            ...(isEmail ? { email: state.contact } : { whatsappNumber: state.contact }),
          });
          setUser(response.data);
          setEditForm(response.data);
        }

        if (user) {
          const jobsResponse = await searchJobs({});
          const userJobs = jobsResponse.data.filter(job => job.postedBy && job.postedBy._id === user._id);
          setPostedJobs(userJobs);

          const applicantsResponse = await getApplicants(user._id);
          setApplicants(applicantsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [state, user, navigate]);

  const handleJobChange = (e) => {
    setJobForm({ ...jobForm, [e.target.name]: e.target.value });
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('User not loaded. Please try again.');
      return;
    }
    try {
      const response = await postJob({ ...jobForm, postedBy: user._id });
      setNotification('Job posted successfully');
      setTimeout(() => setNotification(''), 3000);
      setJobForm({
        jobTitle: '',
        skillType: 'IT',
        skills: '',
        experienceRequired: '',
        location: '',
        maxCTC: '',
        noticePeriod: '',
      });
      setShowForm(false);
      const jobsResponse = await searchJobs({});
      const userJobs = jobsResponse.data.filter(job => job.postedBy && job.postedBy._id === user._id);
      setPostedJobs(userJobs);
    } catch (error) {
      console.error('Error posting job:', error);
      setNotification('Error posting job');
    }
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      const response = await updateProviderProfile({ ...editForm, _id: user._id });
      setUser(response.data.user);
      setEditMode(false);
      setNotification('Profile updated successfully');
      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification('Error updating profile');
    }
  };

  const handleMassMailToggle = async () => {
    if (!showMassMail && seekers.length === 0) {
      try {
        const response = await searchSeekers({});
        setSeekers(response.data);
      } catch (error) {
        console.error('Error fetching seekers:', error);
      }
    }
    setShowMassMail(!showMassMail);
  };

  const handleMailChange = (e) => {
    setMailForm({ ...mailForm, [e.target.name]: e.target.value });
  };

  const handleSeekerSelect = (seekerId) => {
    setSelectedSeekers(prev =>
      prev.includes(seekerId) ? prev.filter(id => id !== seekerId) : [...prev, seekerId]
    );
  };

  const handleSendMassEmail = async (e) => {
    e.preventDefault();
    if (selectedSeekers.length === 0) {
      alert('Please select at least one seeker');
      return;
    }
    try {
      const response = await sendMassEmail({
        seekerIds: selectedSeekers,
        subject: mailForm.subject,
        body: mailForm.body,
      });
      setNotification('Mass emails sent successfully');
      setTimeout(() => setNotification(''), 3000);
      setMailForm({ subject: '', body: '' });
      setSelectedSeekers([]);
      setShowMassMail(false);
    } catch (error) {
      console.error('Error sending mass email:', error);
      setNotification('Error sending mass email');
    }
  };

  const handleSeekerSearchChange = (e) => {
    setSearchSeekerForm({ ...searchSeekerForm, [e.target.name]: e.target.value });
  };

  const handleSeekerFilterChange = (filter) => {
    setSearchSeekerForm(prev => ({
      ...prev,
      filters: prev.filters.includes(filter)
        ? prev.filters.filter(f => f !== filter)
        : [...prev.filters, filter],
    }));
  };

  const handleSearchSeekers = async (e) => {
    e.preventDefault();
    try {
      const response = await searchSeekers({ ...searchSeekerForm, filters: searchSeekerForm.filters.join(',') });
      setSearchedSeekers(response.data);
    } catch (error) {
      console.error('Error searching seekers:', error);
      setSearchedSeekers([]);
    }
  };

  const handleSaveSearch = async () => {
    try {
      const response = await saveSearch({ userId: user._id, role: 'provider', searchCriteria: searchSeekerForm });
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

  const handleSearchSeekersToggle = () => {
    setShowSearchSeekers(!showSearchSeekers);
  };

  const handleViewSeekerProfile = (seekerId) => {
    navigate(`/seeker-profile/${seekerId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
        <Header />
        <main className="flex-grow flex items-center justify-center p-6">
          <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
        <Header />
        <main className="flex-grow flex items-center justify-center p-6">
          <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">Error loading user. Please log in again.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
      <Header />
      <main className="flex-grow p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
          Job Provider Dashboard
        </h2>
        {notification && (
          <div className="fixed top-4 right-4 bg-green-500 text-white p-2 rounded shadow-md">
            {notification}
          </div>
        )}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            {editMode ? (
              <div className="space-y-4">
                <input
                  name="companyName"
                  value={editForm.companyName || ''}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="Company Name"
                />
                <input
                  name="hrName"
                  value={editForm.hrName || ''}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="HR Name"
                />
                <input
                  name="hrWhatsappNumber"
                  value={editForm.hrWhatsappNumber || ''}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="HR WhatsApp Number"
                />
                <input
                  name="email"
                  value={editForm.email || ''}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="Email"
                />
                <button
                  onClick={handleSaveProfile}
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 push-button"
                >
                  Save Profile
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600 push-button"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <p><strong>Company:</strong> {user.companyName}</p>
                <p><strong>HR Name:</strong> {user.hrName}</p>
                <p><strong>WhatsApp:</strong> {user.hrWhatsappNumber || 'N/A'}</p>
                <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                <button
                  onClick={() => setEditMode(true)}
                  className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 push-button"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
          <div className="flex space-x-4 border border-gray-200 dark:border-gray-700 p-2 rounded-lg">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 push-button"
            >
              {showForm ? 'Hide Form' : 'Post a New Job'}
            </button>
            <button
              onClick={handleMassMailToggle}
              className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600 push-button"
            >
              {showMassMail ? 'Hide Mass Mail' : 'Send Mass Email'}
            </button>
            <button
              onClick={handleSearchSeekersToggle}
              className="bg-teal-500 text-white p-2 rounded hover:bg-teal-600 push-button"
            >
              {showSearchSeekers ? 'Hide Search' : 'Search Job Seekers'}
            </button>
          </div>
          {showForm && (
            <form onSubmit={handlePostJob} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md space-y-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Post a Job</h3>
              <input name="jobTitle" value={jobForm.jobTitle} onChange={handleJobChange} placeholder="Job Title" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required />
              <select name="skillType" value={jobForm.skillType} onChange={handleJobChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
                <option value="IT">IT</option>
                <option value="Non-IT">Non-IT</option>
              </select>
              <input name="skills" value={jobForm.skills} onChange={handleJobChange} placeholder="Skills (comma-separated)" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required />
              <input name="experienceRequired" type="number" value={jobForm.experienceRequired} onChange={handleJobChange} placeholder="Experience Required (years)" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required />
              <input name="location" value={jobForm.location} onChange={handleJobChange} placeholder="Location" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required />
              <input name="maxCTC" type="number" value={jobForm.maxCTC} onChange={handleJobChange} placeholder="Max CTC" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required />
              <input name="noticePeriod" value={jobForm.noticePeriod} onChange={handleJobChange} placeholder="Notice Period" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required />
              <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 push-button">Post Job</button>
            </form>
          )}
          {showMassMail && (
            <div className="space-y-4">
              <form onSubmit={handleSearchSeekers} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md space-y-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Search Seekers</h3>
                <input
                  name="skills"
                  value={searchSeekerForm.skills}
                  onChange={handleSeekerSearchChange}
                  placeholder="Skills (comma-separated)"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                />
                <input
                  name="experience"
                  type="number"
                  value={searchSeekerForm.experience}
                  onChange={handleSeekerSearchChange}
                  placeholder="Max Experience (years)"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                />
                <input
                  name="location"
                  value={searchSeekerForm.location}
                  onChange={handleSeekerSearchChange}
                  placeholder="Location"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                />
                <input
                  name="minCTC"
                  type="number"
                  value={searchSeekerForm.minCTC}
                  onChange={handleSeekerSearchChange}
                  placeholder="Min CTC"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                />
                <input
                  name="maxCTC"
                  type="number"
                  value={searchSeekerForm.maxCTC}
                  onChange={handleSeekerSearchChange}
                  placeholder="Max CTC"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                />
                <div className="flex space-x-4">
                  <label className="flex items-center text-gray-900 dark:text-gray-100">
                    <input
                      type="checkbox"
                      checked={searchSeekerForm.filters.includes('viewed')}
                      onChange={() => handleSeekerFilterChange('viewed')}
                      className="mr-2"
                    />
                    Viewed
                  </label>
                  <label className="flex items-center text-gray-900 dark:text-gray-100">
                    <input
                      type="checkbox"
                      checked={searchSeekerForm.filters.includes('new')}
                      onChange={() => handleSeekerFilterChange('new')}
                      className="mr-2"
                    />
                    New (Last 30 Days)
                  </label>
                </div>
                <div className="flex space-x-4">
                  <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 push-button">Search Seekers</button>
                  <button
                    type="button"
                    onClick={handleSaveSearch}
                    className="w-full bg-teal-500 text-white p-2 rounded hover:bg-teal-600 push-button"
                  >
                    Save Search
                  </button>
                </div>
              </form>
              <form onSubmit={handleSendMassEmail} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md space-y-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Send Mass Email</h3>
                <input
                  name="subject"
                  value={mailForm.subject}
                  onChange={handleMailChange}
                  placeholder="Email Subject"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                  required
                />
                <textarea
                  name="body"
                  value={mailForm.body}
                  onChange={handleMailChange}
                  placeholder="Email Body"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                  rows="4"
                  required
                />
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Select Seekers</h4>
                  {seekers.map(seeker => (
                    <div key={seeker._id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSeekers.includes(seeker._id)}
                        onChange={() => handleSeekerSelect(seeker._id)}
                        className="mr-2"
                      />
                      <span className="text-gray-900 dark:text-gray-100">{seeker.fullName} ({seeker.email || 'No email'})</span>
                    </div>
                  ))}
                </div>
                <button type="submit" className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600 push-button">Send Emails</button>
              </form>
            </div>
          )}
          {showSearchSeekers && (
            <div className="space-y-4">
              <form onSubmit={handleSearchSeekers} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md space-y-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Search Job Seekers</h3>
                <input
                  name="skills"
                  value={searchSeekerForm.skills}
                  onChange={handleSeekerSearchChange}
                  placeholder="Skills (comma-separated)"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                />
                <input
                  name="experience"
                  type="number"
                  value={searchSeekerForm.experience}
                  onChange={handleSeekerSearchChange}
                  placeholder="Max Experience (years)"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                />
                <input
                  name="location"
                  value={searchSeekerForm.location}
                  onChange={handleSeekerSearchChange}
                  placeholder="Location"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                />
                <input
                  name="minCTC"
                  type="number"
                  value={searchSeekerForm.minCTC}
                  onChange={handleSeekerSearchChange}
                  placeholder="Min CTC"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                />
                <input
                  name="maxCTC"
                  type="number"
                  value={searchSeekerForm.maxCTC}
                  onChange={handleSeekerSearchChange}
                  placeholder="Max CTC"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                />
                <div className="flex space-x-4">
                  <label className="flex items-center text-gray-900 dark:text-gray-100">
                    <input
                      type="checkbox"
                      checked={searchSeekerForm.filters.includes('viewed')}
                      onChange={() => handleSeekerFilterChange('viewed')}
                      className="mr-2"
                    />
                    Viewed
                  </label>
                  <label className="flex items-center text-gray-900 dark:text-gray-100">
                    <input
                      type="checkbox"
                      checked={searchSeekerForm.filters.includes('new')}
                      onChange={() => handleSeekerFilterChange('new')}
                      className="mr-2"
                    />
                    New (Last 30 Days)
                  </label>
                </div>
                <div className="flex space-x-4">
                  <button type="submit" className="w-full bg-teal-500 text-white p-2 rounded hover:bg-teal-600 push-button">Search</button>
                  <button
                    type="button"
                    onClick={handleSaveSearch}
                    className="w-full bg-teal-500 text-white p-2 rounded hover:bg-teal-600 push-button"
                  >
                    Save Search
                  </button>
                </div>
              </form>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Saved Searches</h3>
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
                  <p className="text-gray-900 dark:text-gray-100">No saved searches yet</p>
                )}
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Search Results</h3>
                {searchedSeekers.length > 0 ? (
                  searchedSeekers.map(seeker => (
                    <div key={seeker._id} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                      <p><strong>Name:</strong> {seeker.fullName}</p>
                      <p><strong>WhatsApp:</strong> {seeker.whatsappNumber || 'N/A'}</p>
                      <p><strong>Email:</strong> {seeker.email || 'N/A'}</p>
                      <p><strong>Skills:</strong> {seeker.skills?.join(', ') || 'N/A'}</p>
                      <p><strong>Experience:</strong> {seeker.experience || 0} years</p>
                      <p><strong>Location:</strong> {seeker.location || 'N/A'}</p>
                      <a
                        href={`https://api.whatsapp.com/send?phone=${seeker.whatsappNumber?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block bg-green-500 text-white p-2 rounded hover:bg-green-600 push-button"
                      >
                        Get Connected on WhatsApp
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-900 dark:text-gray-100">No seekers found</p>
                )}
              </div>
            </div>
          )}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Your Posted Jobs</h3>
            {postedJobs.length > 0 ? (
              postedJobs.map((job) => (
                <div key={job._id} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                  <p><strong>Title:</strong> {job.jobTitle}</p>
                  <p><strong>Skills:</strong> {job.skills.join(', ')}</p>
                  <p><strong>Experience:</strong> {job.experienceRequired} years</p>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p><strong>Max CTC:</strong> {job.maxCTC}</p>
                  <p><strong>Notice Period:</strong> {job.noticePeriod}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-900 dark:text-gray-100">No jobs posted yet</p>
            )}
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Applicants</h3>
            {applicants.length > 0 ? (
              <ul className="space-y-2">
                {applicants.map((applicant, index) => (
                  <li key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                    <p><strong>Job:</strong> {applicant.jobTitle}</p>
                    <p><strong>Seeker:</strong> {applicant.seeker.fullName}</p>
                    <p><strong>Email:</strong> {applicant.seeker.email || 'N/A'}</p>
                    <p><strong>WhatsApp:</strong> {applicant.seeker.whatsappNumber || 'N/A'}</p>
                    <button
                      onClick={() => handleViewSeekerProfile(applicant.seeker._id)}
                      className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 push-button"
                    >
                      View Profile
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-900 dark:text-gray-100">No applicants yet</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProviderDashboard;