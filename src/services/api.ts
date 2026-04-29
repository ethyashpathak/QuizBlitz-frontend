import axios from 'axios';
import toast from 'react-hot-toast';
import type { ApiError } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for sending/receiving cookies for auth
});

// Response interceptor to handle errors globally and show toast messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data as ApiError | undefined;

    // Only show toast if it's not a 401 on the root fetch (which happens on first load when logged out)
    if (error.response?.status === 401 && error.config.url === '/') {
      return Promise.reject(error);
    }

    if (errorData?.errorMessage) {
      toast.error(errorData.errorMessage);
    } else {
      toast.error('Something went wrong. Please try again.');
    }
    return Promise.reject(error);
  }
);
