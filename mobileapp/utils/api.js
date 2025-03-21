import axios from 'axios';
import { Platform } from 'react-native';

// Local backend URL with your IP
// const BASE_URL = Platform.OS === 'web' ? 'http://localhost:5000/api' : 'http://192.168.31.124:5000/api';
const BASE_URL = Platform.OS === 'web' ? 'https://jobconnector-backend.onrender.com/api' : 'https://jobconnector-backend.onrender.com/api';

// Default axios instance for JSON requests
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Commented out Render URL for later use
// const api = axios.create({
//   baseURL: 'https://jobconnector-backend.onrender.com/api',
//   headers: { 'Content-Type': 'application/json' },
// });

// Authentication
export const requestOTP = (data) => api.post('/auth/request-otp', data);
export const verifyOTP = (data) => api.post('/auth/verify-otp', data);

// Profile
export const getProfile = async (data) => {
  try {
    // const response = await axios.get('http://192.168.31.124:5000/api/auth/profile', { params: data });
    const response = await axios.get('https://jobconnector-backend.onrender.com/api/auth/profile', { params: data });
    
    return response;
  } catch (error) {
    console.error('getProfile error:', error);
    throw error;
  }
};

// Updated createSeekerProfile to handle FormData for resume upload
export const createSeekerProfile = (data) => {
  console.log('Sending createSeekerProfile request with data:', [...data.entries()]);
  return axios.post(`${BASE_URL}/profile/seeker`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Updated updateSeekerProfile to handle FormData for resume upload and fix endpoint
export const updateSeekerProfile = (data) => {
  console.log('Sending updateSeekerProfile request with data:', [...data.entries()]);
  return axios.post(`${BASE_URL}/profile/seeker/update`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const createProviderProfile = (data) => api.post('/profile/provider', data);
export const updateProviderProfile = (data) => api.post('/profile/provider/update', data);

// Jobs
export const postJob = (data) => api.post('/jobs/post', data);
export const searchJobs = (data) => api.get('/jobs/search', { params: data });
export const sendWhatsAppMessage = (data) => api.post('/jobs/whatsapp', data);
export const getTrendingSkills = () => api.get('/jobs/trending-skills');
export const sendMassEmail = (data) => api.post('/jobs/mass-email', data);
export const searchSeekers = (data) => api.get('/jobs/seekers', { params: data });

// Excel upload using fetch (unchanged, already handles FormData)
export const uploadExcel = (formData) => {
  console.log('API Request - uploadExcel FormData:', formData._parts);
  return fetch(`${BASE_URL}/jobs/upload-excel`, {
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
          throw new Error(json.message || `Upload failed with status ${response.status}`);
        }
        return json;
      });
    })
    .catch(error => {
      console.error('Fetch error:', error.message, error.stack);
      throw error;
    });
};

export const deleteSeeker = (data) => api.post('/jobs/delete-seeker', data);
export const deleteJob = (data) => api.post('/jobs/delete', data);
export const saveSearch = (data) => api.post('/jobs/save-search', data);
export const applyToJob = (data) => api.post('/jobs/apply-job', data);
export const getApplicants = (jobId) => api.get('/jobs/applicants', { params: { jobId } });
export const getPostedJobs = () => api.get('/jobs/posted');
export const updateJob = async (data) => {
  try {
    const response = await axios.put(`/api/jobs/${data._id}`, data); // Changed to PUT and dynamic ID
    return response;
  } catch (error) {
    console.error('updateJob error:', error);
    throw error;
  }
};
export default api;