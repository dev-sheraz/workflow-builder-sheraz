// Axios HTTP client configuration for API communication
import axios from 'axios';

// Base URL for all API requests - points to local development server
const API_BASE_URL = 'http://localhost:4000';

/**
 * Configured Axios instance for API communication
 * Includes default settings for timeout, headers, and base URL
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000, // 10 second timeout for requests
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - logs outgoing API requests
 * Helpful for debugging and monitoring API calls
 */
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handles API responses and errors
 * Logs errors and passes successful responses through unchanged
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);