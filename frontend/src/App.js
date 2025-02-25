// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import AdminAuth from './pages/AdminAuth';
import SeekerDashboard from './pages/SeekerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SeekerProfile from './pages/SeekerProfile';
import SeekerProfileView from './pages/SeekerProfileView'; // New profile view
import ProviderProfile from './pages/ProviderProfile';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/:role" element={<Auth />} />
          <Route path="/admin-login" element={<AdminAuth />} />
          <Route path="/seeker-dashboard" element={<SeekerDashboard />} />
          <Route path="/provider-dashboard" element={<ProviderDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/seeker-profile" element={<SeekerProfile />} />
          <Route path="/seeker-profile/:id" element={<SeekerProfileView />} />
          <Route path="/provider-profile" element={<ProviderProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;