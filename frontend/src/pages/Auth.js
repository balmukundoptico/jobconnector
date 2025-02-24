// src/pages/Auth.js
import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthForm from '../components/AuthForm';

const Auth = () => {
  const { role } = useParams(); // Get role from URL (seeker or provider)

  // Validate role
  if (role !== 'seeker' && role !== 'provider') {
    return <div>Invalid role</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <AuthForm role={role} />
      </main>
      <Footer />
    </div>
  );
};

export default Auth;