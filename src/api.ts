// src/api.ts
import axios from 'axios';

// Create an Axios instance pointing to our local Django REST Framework container server
const api = axios.create({
  baseURL: '/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically intercept every outbound HTTP call and inject 
// the secret user access token if it exists in local secure storage.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jobtracker_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Seamless session rotation engine. If an access token expires (HTTP 401 Unauthorized),
// we capture the failure and transparently request a brand new access key using our 7-day refresh token.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite retry loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('jobtracker_refresh_token');
      
      if (refreshToken) {
        try {
          // Talk to our secret Django simplejwt endpoint to issue a dynamic refresh rotation
          const { data } = await axios.post('/api/token/refresh/', {
            refresh: refreshToken
          });
          
          // Persist the fresh key details
          localStorage.setItem('jobtracker_access_token', data.access);
          
          // Re-fire the original user operation with the newly fetched credential!
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh session expired entirely; boot user cleanly to credentials check screen
          localStorage.removeItem('jobtracker_access_token');
          localStorage.removeItem('jobtracker_refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
