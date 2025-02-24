// frontend/src/components/Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 p-4 text-center border-t border-gray-200 dark:border-gray-700">
      <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">
        © {new Date().getFullYear()} Job Connector. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;