// O:\JobConnector\frontend\src\utils\api.js
import axios from 'axios';

// API instance with updated base URL pointing to the new Render backend
const api = axios.create({
  baseURL: 'https://jobconnector-backend.onrender.com/api', // Updated from http://localhost:5000/api
  headers: { 'Content-Type': 'application/json' },
});

// Authentication APIs
export const requestOTP = (data) => api.post('/auth/request-otp', data);
export const verifyOTP = (data) => api.post('/auth/verify-otp', data);

// Profile APIs
export const createSeekerProfile = (data) => api.post('/profile/seeker', data);
export const createProviderProfile = (data) => api.post('/profile/provider', data);
export const getProfile = (params) => api.get('/profile', { params }); // Updated from /profile/get
export const updateSeekerProfile = (data) => api.post('/profile/seeker/update', data, { // Updated from /profile/update-seeker
  headers: { 'Content-Type': 'multipart/form-data' }, // For resume uploads
});
export const updateProviderProfile = (data) => api.post('/profile/provider/update', data); // Updated from /profile/update-provider

// Job APIs
export const postJob = (data) => api.post('/jobs/post', data);
export const searchJobs = (params) => api.get('/jobs/search', { params });
export const sendWhatsAppMessage = (data) => api.post('/jobs/whatsapp', data);
export const getTrendingSkills = () => api.get('/jobs/trending-skills');
export const sendMassEmail = (data) => api.post('/jobs/mass-email', data);
export const searchSeekers = (params) => api.get('/jobs/seekers', { params });
export const uploadExcel = (formData) => api.post('/jobs/upload-excel', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteSeeker = (seekerId) => api.post('/jobs/delete-seeker', { seekerId });
export const deleteJob = (jobId) => api.post('/jobs/delete', { jobId }); // Updated from /jobs/delete-job
export const saveSearch = (data) => api.post('/jobs/save-search', data);
export const applyToJob = (data) => api.post('/jobs/apply-job', data); // Updated from /jobs/apply
export const getApplicants = (providerId) => api.get('/jobs/applicants', { params: { jobId: providerId } }); // Updated from /jobs/applicants/:providerId

export default api; // Export API instance