// frontend/src/components/Header.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import logo from '../assets/logo.png';

const Header = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || false;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
      <Link to="/" className="flex items-center space-x-2">
        <img src={logo} alt="Job Connector Logo" className="h-10 w-10" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Job Connector</h1>
      </Link>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/login')}
          className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
        >
          Login
        </button>
        <button
          onClick={() => navigate('/register')}
          className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
        >
          Register
        </button>
        <Link to="/admin-login" className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400">
          <FiSettings size={24} />
        </Link>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
};

export default Header;