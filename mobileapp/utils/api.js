// mobileapp/utils/api.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'http://192.168.31.124:5000/api', // Replace with your IPv4 from ipconfig
});

export const requestOTP = (data) => api.post('/auth/request-otp', data);
export const verifyOTP = (data) => api.post('/auth/verify-otp', data);
export const createSeekerProfile = (data) => api.post('/profile/seeker', data);
export const createProviderProfile = (data) => api.post('/profile/provider', data);

export default api;