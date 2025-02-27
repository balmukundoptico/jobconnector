// mobileapp/utils/api.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Mock API for production testing
const mockApi = {
  post: async (endpoint, data) => {
    console.log('Mock API call:', endpoint, data);
    if (endpoint === '/auth/request-otp') {
      return { data: { message: 'OTP sent (mock)', serverOtp: '123456' } };
    } else if (endpoint === '/auth/verify-otp') {
      if (data.bypass) {
        const isNewUser = !localStorage.getItem(`user-${data.email || data.whatsappNumber}`);
        return { data: { message: 'Bypass successful', isNewUser, success: true } };
      }
      return { data: { message: 'OTP verification successful', isNewUser: true } };
    } else if (endpoint === '/profile/seeker' || endpoint === '/profile/provider') {
      return { data: { message: 'Profile saved' } };
    }
    throw new Error('Mock API endpoint not implemented');
  },
  get: async () => ({ data: [] }) // Mock for job search
};

// Use mock API in production builds
const api = process.env.NODE_ENV === 'production' ? mockApi : axios.create({
  baseURL: 'http://192.168.31.124:5000/api', // Local dev URL
});

export const requestOTP = (data) => api.post('/auth/request-otp', data);
export const verifyOTP = (data) => api.post('/auth/verify-otp', data);
export const createSeekerProfile = (data) => api.post('/profile/seeker', data);
export const createProviderProfile = (data) => api.post('/profile/provider', data);

export default api;