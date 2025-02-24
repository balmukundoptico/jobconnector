// frontend/src/pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getProfile, uploadExcel, searchSeekers, searchJobs, deleteSeeker, deleteJob } from '../utils/api';

const AdminDashboard = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(state?.user || null);
  const [file, setFile] = useState(null);
  const [type, setType] = useState('seekers');
  const [message, setMessage] = useState('');
  const [seekers, setSeekers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ seekers: 0, providers: 0, jobs: 0 });

  useEffect(() => {
    if (!state?.contact) {
      navigate('/admin-login');
      return;
    }

    const fetchData = async () => {
      try {
        if (!user) {
          const isEmail = state.contact.includes('@');
          const response = await getProfile({
            role: 'admin',
            ...(isEmail ? { email: state.contact } : { whatsappNumber: state.contact }),
          });
          setUser(response.data);
        }

        const seekersResponse = await searchSeekers({});
        const jobsResponse = await searchJobs({});
        setSeekers(seekersResponse.data);
        setJobs(jobsResponse.data);
        setStats({
          seekers: seekersResponse.data.length,
          jobs: jobsResponse.data.length,
          providers: new Set(jobsResponse.data.map(job => job.postedBy?._id)).size,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [user, state, navigate]);

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
      setMessage(`${response.data.message} - ${type === 'seekers' ? response.data.seekersCount : response.data.jobsCount} records imported`);
      setFile(null);
      const seekersResponse = await searchSeekers({});
      const jobsResponse = await searchJobs({});
      setSeekers(seekersResponse.data);
      setJobs(jobsResponse.data);
      setStats({
        seekers: seekersResponse.data.length,
        jobs: jobsResponse.data.length,
        providers: new Set(jobsResponse.data.map(job => job.postedBy?._id)).size,
      });
    } catch (error) {
      console.error('Error uploading Excel:', error);
      setMessage('Error uploading Excel');
    }
  };

  const handleDeleteSeeker = async (seekerId) => {
    if (window.confirm('Are you sure you want to delete this seeker?')) {
      try {
        await deleteSeeker(seekerId);
        setSeekers(seekers.filter(seeker => seeker._id !== seekerId));
        setStats(prev => ({ ...prev, seekers: prev.seekers - 1 }));
        setMessage('Seeker deleted successfully');
      } catch (error) {
        console.error('Error deleting seeker:', error);
        setMessage('Error deleting seeker');
      }
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(jobId);
        setJobs(jobs.filter(job => job._id !== jobId));
        setStats(prev => ({ ...prev, jobs: prev.jobs - 1 }));
        setMessage('Job deleted successfully');
      } catch (error) {
        console.error('Error deleting job:', error);
        setMessage('Error deleting job');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-200 dark:bg-gray-950">
      <Header />
      <main className="flex-grow p-4 sm:p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center sm:text-left">
          Admin Dashboard
        </h2>
        {user ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100">
              <p>Welcome, {user.fullName || 'Admin'}!</p>
              <p><strong>Total Job Seekers:</strong> {stats.seekers}</p>
              <p><strong>Total Job Providers:</strong> {stats.providers}</p>
              <p><strong>Total Jobs:</strong> {stats.jobs}</p>
            </div>
            <form onSubmit={handleUpload} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 space-y-4">
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
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Job Seekers</h3>
              {seekers.length > 0 ? (
                <ul className="space-y-2">
                  {seekers.map(seeker => (
                    <li key={seeker._id} className="flex justify-between items-center">
                      <span>{seeker.fullName} ({seeker.email || 'No email'})</span>
                      <button
                        onClick={() => handleDeleteSeeker(seeker._id)}
                        className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No seekers found</p>
              )}
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Posted Jobs</h3>
              {jobs.length > 0 ? (
                <ul className="space-y-2">
                  {jobs.map(job => (
                    <li key={job._id} className="flex justify-between items-center">
                      <span>{job.jobTitle} - {job.postedBy?.companyName || 'Unknown Provider'}</span>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No jobs found</p>
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