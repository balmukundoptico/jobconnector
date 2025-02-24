// frontend/src/pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getProfile, uploadExcel, searchSeekers, searchJobs } from '../utils/api';

const AdminDashboard = () => {
  const { state } = useLocation();
  const [user, setUser] = useState(state?.user || null);
  const [file, setFile] = useState(null);
  const [type, setType] = useState('seekers');
  const [message, setMessage] = useState('');
  const [seekers, setSeekers] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (!user && state?.contact) {
      const fetchProfile = async () => {
        try {
          const isEmail = state.contact.includes('@');
          const response = await getProfile({
            role: 'admin',
            ...(isEmail ? { email: state.contact } : { whatsappNumber: state.contact }),
          });
          setUser(response.data);
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      };
      fetchProfile();
    }
    const fetchData = async () => {
      try {
        const seekersResponse = await searchSeekers({});
        const jobsResponse = await searchJobs({});
        setSeekers(seekersResponse.data);
        setJobs(jobsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [user, state]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    try {
      const response = await uploadExcel(formData);
      setMessage(response.data.message);
      setFile(null);
      const seekersResponse = await searchSeekers({});
      const jobsResponse = await searchJobs({});
      setSeekers(seekersResponse.data);
      setJobs(jobsResponse.data);
    } catch (error) {
      console.error('Error uploading Excel:', error);
      setMessage('Error uploading Excel');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="flex-grow p-4 sm:p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center sm:text-left">
          Admin Dashboard
        </h2>
        {user ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                Welcome, {user.fullName || 'Admin'}!
              </p>
            </div>
            <form onSubmit={handleUpload} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Excel Data</h3>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
              >
                <option value="seekers">Job Seekers</option>
                <option value="jobs">Jobs</option>
              </select>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
              />
              <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Upload</button>
            </form>
            {message && (
              <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">{message}</p>
            )}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Job Seekers</h3>
              {seekers.length > 0 ? (
                <ul className="space-y-2">
                  {seekers.map(seeker => (
                    <li key={seeker._id} className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                      {seeker.fullName} ({seeker.email || 'No email'})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">No seekers found</p>
              )}
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Posted Jobs</h3>
              {jobs.length > 0 ? (
                <ul className="space-y-2">
                  {jobs.map(job => (
                    <li key={job._id} className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                      {job.jobTitle} - {job.postedBy ? job.postedBy.companyName : 'Unknown Provider'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">No jobs found</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">Loading profile...</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;