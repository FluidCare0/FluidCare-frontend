import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8001/api/',
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor → attach access token
api.interceptors.request.use((config) => {
  const access = localStorage.getItem('access');
  if (access) {
    config.headers['Authorization'] = `Bearer ${access}`;
  }
  return config;
});

// Response interceptor → auto-refresh tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          'http://localhost:8001/api/auth/refresh/',
          {},
          { withCredentials: true }
        );
        
        const newAccess = res.data.access;
        localStorage.setItem('access', newAccess);
        
        // Process queued requests
        processQueue(null, newAccess);
        
        // Retry original request
        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Process queued requests with error
        processQueue(refreshError, null);
        
        // Clear storage and redirect to login
        localStorage.removeItem('access');
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
          window.location.href = '/';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;