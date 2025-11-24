import axios from 'axios';

const staffApi = axios.create({
    baseURL: 'http://localhost:8000/api/auth/',
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
staffApi.interceptors.request.use((config) => {
    const access = localStorage.getItem('access');
    if (access) {
        config.headers['Authorization'] = `Bearer ${access}`;
    }
    return config;
});

// Response interceptor → auto-refresh tokens
staffApi.interceptors.response.use(
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
                    return staffApi(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await axios.post(
                    'http://localhost:8000/api/auth/refresh/',
                    {},
                    { withCredentials: true }
                );

                const newAccess = res.data.access;
                localStorage.setItem('access', newAccess);

                // Process queued requests
                processQueue(null, newAccess);

                // Retry original request
                originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
                return staffApi(originalRequest);

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

// Staff management API functions
export const staffApiService = {
    // Get all staff members with optional filters
    getAllStaff: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.role) params.append('role', filters.role);
        if (filters.status) params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);

        return staffApi.get(`/users/?${params.toString()}`);
    },

    // Create a new staff member
    createStaff: (staffData) => {
        return staffApi.post('/users/create/', staffData);
    },

    // Get specific staff member
    getStaffById: (id) => {
        return staffApi.get(`/users/${id}/`);
    },

    // Update staff member
    updateStaff: (id, staffData) => {
        return staffApi.put(`/users/${id}/update/`, staffData);
    },

    // Delete staff member
    deleteStaff: (id) => {
        return staffApi.delete(`/users/${id}/delete/`);
    }
};

export default staffApi;