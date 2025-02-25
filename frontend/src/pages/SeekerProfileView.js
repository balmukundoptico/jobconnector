// frontend/src/pages/SeekerProfileView.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getProfile } from '../utils/api';

const SeekerProfileView = () => {
  const { id } = useParams(); // Get seeker ID from URL
  const navigate = useNavigate();
  const [seeker, setSeeker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeekerProfile = async () => {
      try {
        const response = await getProfile({ role: 'seeker', seekerId: id });
        setSeeker(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching seeker profile:', err);
        setError('Failed to load profile');
        setLoading(false);
      }
    };
    fetchSeekerProfile();
  }, [id]);

  const handleBack = () => {
    navigate(-1); // Go back to previous page (ProviderDashboard)
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

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
        <Header />
        <main className="flex-grow flex items-center justify-center p-6">
          <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">{error}</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
      <Header />
      <main className="flex-grow p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Seeker Profile</h2>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
          <p><strong>Name:</strong> {seeker.fullName}</p>
          <p><strong>WhatsApp:</strong> {seeker.whatsappNumber || 'N/A'}</p>
          <p><strong>Email:</strong> {seeker.email || 'N/A'}</p>
          <p><strong>Skills:</strong> {seeker.skills?.join(', ') || 'N/A'}</p>
          <p><strong>Experience:</strong> {seeker.experience || 0} years</p>
          <p><strong>Location:</strong> {seeker.location || 'N/A'}</p>
          <button
            onClick={handleBack}
            className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 push-button"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SeekerProfileView;