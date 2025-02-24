// frontend/src/pages/Login.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Login = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(`/auth/${role}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Are you a Job Seeker or Job Provider?
          </h2>
          <div className="space-x-4">
            <button
              onClick={() => handleRoleSelect('seeker')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
            >
              Job Seeker
            </button>
            <button
              onClick={() => handleRoleSelect('provider')}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
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

export default Login;