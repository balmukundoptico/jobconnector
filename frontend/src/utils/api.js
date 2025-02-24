// frontend/src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Authentication APIs
export const requestOTP = (data) => api.post('/auth/request-otp', data);
export const verifyOTP = (data) => api.post('/auth/verify-otp', data);

// Profile APIs
export const createSeekerProfile = (data) => api.post('/profile/seeker', data);
export const createProviderProfile = (data) => api.post('/profile/provider', data);
export const getProfile = (params) => api.get('/profile/get', { params });

// Job APIs
export const postJob = (data) => api.post('/jobs/post', data);
export const searchJobs = (params) => api.get('/jobs/search', { params });
export const sendWhatsAppMessage = (data) => api.post('/jobs/whatsapp', data);
export const getTrendingSkills = () => api.get('/jobs/trending-skills');
export const sendMassEmail = (data) => api.post('/jobs/mass-email', data);
// frontend/src/utils/api.js
export const searchSeekers = (params) => api.get('/jobs/seekers', { params });
export default api;
// frontend/src/utils/api.js
export const uploadExcel = (formData) => api.post('/jobs/upload-excel', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});