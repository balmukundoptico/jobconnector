// frontend/src/pages/SeekerProfile.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { createSeekerProfile } from '../utils/api';

const SeekerProfile = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    whatsappNumber: state?.contact && !state?.isEmail ? state.contact : '',
    email: state?.contact && state?.isEmail ? state.contact : '',
    skillType: 'IT',
    skills: '',
    experience: '',
    location: '',
    currentCTC: '',
    expectedCTC: '',
    noticePeriod: '',
    lastWorkingDate: '',
    resume: '',
    bio: '',
  });
  const [focusedField, setFocusedField] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFocus = (name) => setFocusedField(name);
  const handleBlur = () => setFocusedField(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting formData:', formData);
    try {
      const response = await createSeekerProfile(formData);
      setMessage(response.data.message);
      navigate('/seeker-dashboard', { state: { user: response.data.user, contact: formData.whatsappNumber || formData.email } });
    } catch (error) {
      console.error('Error creating profile:', error);
      setMessage(error.response?.data?.message || 'Error creating seeker profile');
    }
  };

  const renderInput = (label, name, type = 'text', placeholder, additionalProps = {}) => (
    <div className="container relative flex flex-col gap-2 mb-6">
      <label
        className={`label absolute text-[15px] font-bold pointer-events-none transition-all duration-300 dark:text-white text-black z-10 bg-gradient-to-b from-transparent via-white to-transparent dark:from-transparent dark:via-gray-800 dark:to-transparent px-1 ${
          focusedField === name || formData[name]
            ? 'top-[-10px] left-[10px] transform -translate-y-1'
            : 'top-[13px] left-[10px]'
        }`}
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        onFocus={() => handleFocus(name)}
        onBlur={handleBlur}
        className={`input w-full h-[45px] rounded-md p-2 text-[15px] bg-transparent outline-none border-none dark:text-white text-black transition-all duration-300 ${
          focusedField === name ? 'transform translate-y-2' : ''
        }`}
        placeholder={focusedField === name ? placeholder : ''}
        required={name === 'fullName'}
        {...additionalProps}
      />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Create Seeker Profile
          </h2>
          <form onSubmit={handleSubmit} className="space-y-2">
            {renderInput('Full Name', 'fullName', 'text', 'Enter full name')}
            {renderInput('WhatsApp Number', 'whatsappNumber', 'text', 'Enter WhatsApp number')}
            {renderInput('Email', 'email', 'email', 'Enter email')}
            <div className="container relative flex flex-col gap-2 mb-6">
              <label
                className={`label absolute text-[15px] font-bold pointer-events-none transition-all duration-300 dark:text-white text-black z-10 bg-gradient-to-b from-transparent via-white to-transparent dark:from-transparent dark:via-gray-800 dark:to-transparent px-1 ${
                  focusedField === 'skillType' || formData.skillType
                    ? 'top-[-10px] left-[10px] transform -translate-y-1'
                    : 'top-[13px] left-[10px]'
                }`}
              >
                Skill Type
              </label>
              <select
                name="skillType"
                value={formData.skillType}
                onChange={handleChange}
                onFocus={() => handleFocus('skillType')}
                onBlur={handleBlur}
                className={`input w-full h-[45px] rounded-md p-2 text-[15px] bg-transparent outline-none border-none dark:text-white text-black transition-all duration-300 ${
                  focusedField === 'skillType' ? 'transform translate-y-2' : ''
                }`}
              >
                <option value="IT">IT</option>
                <option value="Non-IT">Non-IT</option>
              </select>
            </div>
            {renderInput('Skills', 'skills', 'text', 'Enter skills (comma-separated)')}
            {renderInput('Experience (years)', 'experience', 'number', 'Enter experience')}
            {renderInput('Location', 'location', 'text', 'Enter location')}
            {renderInput('Current CTC', 'currentCTC', 'number', 'Enter current CTC')}
            {renderInput('Expected CTC', 'expectedCTC', 'number', 'Enter expected CTC')}
            {renderInput('Notice Period', 'noticePeriod', 'text', 'Enter notice period')}
            {renderInput('Last Working Date', 'lastWorkingDate', 'date', 'YYYY-MM-DD')}
            {renderInput('Resume URL', 'resume', 'text', 'Enter resume URL')}
            <div className="container relative flex flex-col gap-2 mb-6">
              <label
                className={`label absolute text-[15px] font-bold pointer-events-none transition-all duration-300 dark:text-white text-black z-10 bg-gradient-to-b from-transparent via-white to-transparent dark:from-transparent dark:via-gray-800 dark:to-transparent px-1 ${
                  focusedField === 'bio' || formData.bio
                    ? 'top-[-10px] left-[10px] transform -translate-y-1'
                    : 'top-[13px] left-[10px]'
                }`}
              >
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                onFocus={() => handleFocus('bio')}
                onBlur={handleBlur}
                className={`input w-full h-[100px] rounded-md p-2 text-[15px] bg-transparent outline-none border-none dark:text-white text-black resize-none transition-all duration-300 ${
                  focusedField === 'bio' ? 'transform translate-y-2' : ''
                }`}
                placeholder={focusedField === 'bio' ? 'Enter bio' : ''}
              />
            </div>
            <button type="submit" className="button w-full">
              <div className="wrap">
                <p>
                  <span>Save Profile</span>
                  <span>Saving...</span>
                </p>
              </div>
            </button>
          </form>
          {message && (
            <p className="text-gray-900 dark:text-gray-100 mt-2 text-center">{message}</p>
          )}
        </div>
      </main>
      <Footer />
      <style jsx>{`
        .container {
          min-height: 65px; /* Reserve space for input and label */
        }
        .input {
          box-shadow: 3px 3px 10px rgba(0, 0, 0, 1), -1px -1px 6px rgba(255, 255, 255, 0.4);
        }
        .input:focus {
          box-shadow: 3px 3px 10px rgba(0, 0, 0, 1), -1px -1px 6px rgba(255, 255, 255, 0.4),
            inset 3px 3px 10px rgba(0, 0, 0, 1), inset -1px -1px 6px rgba(255, 255, 255, 0.4);
        }
        .label {
          padding: 0 4px;
        }
        .button {
          --white: #ffe7ff;
          --bg: #080808;
          --radius: 100px;
          outline: none;
          cursor: pointer;
          border: 0;
          position: relative;
          border-radius: var(--radius);
          background-color: var(--bg);
          transition: all 0.2s ease;
          box-shadow: inset 0 0.3rem 0.9rem rgba(255, 255, 255, 0.3),
            inset 0 -0.1rem 0.3rem rgba(0, 0, 0, 0.7),
            inset 0 -0.4rem 0.9rem rgba(255, 255, 255, 0.5),
            0 3rem 3rem rgba(0, 0, 0, 0.3),
            0 1rem 1rem -0.6rem rgba(0, 0, 0, 0.8);
        }
        .button .wrap {
          font-size: 25px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
          padding: 32px 45px;
          border-radius: inherit;
          position: relative;
          overflow: hidden;
        }
        .button .wrap p span:nth-child(2) {
          display: none;
        }
        .button:hover .wrap p span:nth-child(1) {
          display: none;
        }
        .button:hover .wrap p span:nth-child(2) {
          display: inline-block;
        }
        .button .wrap p {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
          transition: all 0.2s ease;
          transform: translateY(2%);
          mask-image: linear-gradient(to bottom, white 40%, transparent);
        }
        .button .wrap::before,
        .button .wrap::after {
          content: '';
          position: absolute;
          transition: all 0.3s ease;
        }
        .button .wrap::before {
          left: -15%;
          right: -15%;
          bottom: 25%;
          top: -100%;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.12);
        }
        .button .wrap::after {
          left: 6%;
          right: 6%;
          top: 12%;
          bottom: 40%;
          border-radius: 22px 22px 0 0;
          box-shadow: inset 0 10px 8px -10px rgba(255, 255, 255, 0.8);
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.3) 0%,
            rgba(0, 0, 0, 0) 50%,
            rgba(0, 0, 0, 0) 100%
          );
        }
        .button:hover {
          box-shadow: inset 0 0.3rem 0.5rem rgba(255, 255, 255, 0.4),
            inset 0 -0.1rem 0.3rem rgba(0, 0, 0, 0.7),
            inset 0 -0.4rem 0.9rem rgba(255, 255, 255, 0.7),
            0 3rem 3rem rgba(0, 0, 0, 0.3),
            0 1rem 1rem -0.6rem rgba(0, 0, 0, 0.8);
        }
        .button:hover .wrap::before {
          transform: translateY(-5%);
        }
        .button:hover .wrap::after {
          opacity: 0.4;
          transform: translateY(5%);
        }
        .button:hover .wrap p {
          transform: translateY(-4%);
        }
        .button:active {
          transform: translateY(4px);
          box-shadow: inset 0 0.3rem 0.5rem rgba(255, 255, 255, 0.5),
            inset 0 -0.1rem 0.3rem rgba(0, 0, 0, 0.8),
            inset 0 -0.4rem 0.9rem rgba(255, 255, 255, 0.4),
            0 3rem 3rem rgba(0, 0, 0, 0.3),
            0 1rem 1rem -0.6rem rgba(0, 0, 0, 0.8);
        }
      `}</style>
    </div>
  );
};

export default SeekerProfile;