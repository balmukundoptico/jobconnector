// O:\JobConnector\mobileapp\utils\api.js
import axios from 'axios';
import { Platform } from 'react-native';

// Local backend URL with your IP
// const BASE_URL = Platform.OS === 'web' ? 'http://localhost:5000/api' : 'http://192.168.31.124:5000/api';

// const api = axios.create({
//   baseURL: BASE_URL,
//   headers: { 'Content-Type': 'application/json' },
// });

// Commented out Render URL for later use
const api = axios.create({
  baseURL: 'https://jobconnector-backend.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

export const requestOTP = (data) => api.post('/auth/request-otp', data);
export const verifyOTP = (data) => api.post('/auth/verify-otp', data);
export const getProfile = (data) => api.get('/profile', { params: data });
export const createSeekerProfile = (data) => api.post('/profile/seeker', data);
export const createProviderProfile = (data) => api.post('/profile/provider', data);
export const updateSeekerProfile = (data) => api.post('/jobs/update-seeker', data);
export const updateProviderProfile = (data) => api.post('/profile/provider/update', data);
export const postJob = (data) => api.post('/jobs/post', data);
export const searchJobs = (data) => api.get('/jobs/search', { params: data });
export const sendWhatsAppMessage = (data) => api.post('/jobs/whatsapp', data);
export const getTrendingSkills = () => api.get('/jobs/trending-skills');
export const sendMassEmail = (data) => api.post('/jobs/mass-email', data);
export const searchSeekers = (data) => api.get('/jobs/seekers', { params: data });
export const uploadExcel = (formData) => {
  console.log('API Request - uploadExcel FormData:', formData._parts);
  return fetch(`${"https://jobconnector-backend.onrender.com/api"}/jobs/upload-excel`, {
    method: 'POST',
    body: formData,
  })
    .then(response => {
      console.log('Response status:', response.status);
      return response.text().then(text => {
        console.log('Raw server response:', text);
        let json;
        try {
          json = JSON.parse(text);
        } catch (e) {
          throw new Error('Invalid JSON response: ' + text);
        }
        if (!response.ok) {
          // Throw an error with the backend's message for non-200 statuses
          throw new Error(json.message || `Upload failed with status ${response.status}`);
        }
        return json; // Return parsed JSON for successful responses
      });
    })
    .catch(error => {
      console.error('Fetch error:', error.message, error.stack);
      throw error; // Re-throw to let the caller handle it
    });
};

export const deleteSeeker = (data) => api.post('/jobs/delete-seeker', data);
export const deleteJob = (data) => api.post('/jobs/delete', data);
export const saveSearch = (data) => api.post('/jobs/save-search', data);
export const applyToJob = (data) => api.post('/jobs/apply-job', data);
export const getApplicants = (jobId) => api.get('/jobs/applicants', { params: { jobId } });
export const getPostedJobs = () => api.get('/jobs/posted');
export const updateJob = (data) => api.post('/jobs/update-job', data);

export default api;