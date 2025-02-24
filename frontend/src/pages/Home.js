// frontend/src/pages/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Welcome to Job Connector</h1>
          <p className="text-gray-900 dark:text-gray-100 mb-6">Find your dream job or hire the perfect candidate!</p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/auth/seeker')}
              className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
            >
              Job Seeker
            </button>
            <button
              onClick={() => navigate('/auth/provider')}
              className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600"
            >
              Job Provider
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;