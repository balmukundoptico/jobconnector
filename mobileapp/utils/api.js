// O:\JobConnector\mobileapp\utils\api.js
import axios from 'axios'; // HTTP client

// Real API connected to Render backend
const api = axios.create({
  baseURL: 'https://jobconnector-backend.onrender.com/api', // LOcal URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Exported functions matching website endpoints
export const requestOTP = (data) => api.post('/auth/request-otp', data);
export const verifyOTP = (data) => api.post('/auth/verify-otp', data);
export const getProfile = (data) => api.get('/profile', { params: data });
export const createSeekerProfile = (data) => api.post('/profile/seeker', data);
export const createProviderProfile = (data) => api.post('/profile/provider', data);
export const updateSeekerProfile = (data) => api.post('/profile/seeker/update', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateProviderProfile = (data) => api.post('/profile/provider/update', data);
export const postJob = (data) => api.post('/jobs/post', data);
export const searchJobs = (data) => api.get('/jobs/search', { params: data });
export const sendWhatsAppMessage = (data) => api.post('/jobs/whatsapp', data);
export const getTrendingSkills = () => api.get('/jobs/trending-skills');
export const sendMassEmail = (data) => api.post('/jobs/mass-email', data);
export const searchSeekers = (data) => api.get('/jobs/seekers', { params: data });
export const uploadExcel = (data) => api.post('/jobs/upload-excel', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteSeeker = (data) => api.post('/jobs/delete-seeker', data);
export const deleteJob = (data) => api.post('/jobs/delete', data);
export const saveSearch = (data) => api.post('/jobs/save-search', data);
export const applyToJob = (data) => api.post('/jobs/apply-job', data);
export const getApplicants = (jobId) => api.get('/jobs/applicants', { params: { jobId } });
export const getPostedJobs = () => api.get('/jobs/posted');

export default api; // Export API instance