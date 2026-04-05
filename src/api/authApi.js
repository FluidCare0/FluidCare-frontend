// src/api/authApi.js
import apiClient from './api';

/**
 * Login user and get tokens
 */
export const login = async (credentials) => {
    try {
        const response = await apiClient.post('auth/login/', credentials);
        return response.data;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

/**
 * Logout user and clear tokens
 */
export const logout = async () => {
    try {
        await apiClient.post('auth/logout/');
        localStorage.removeItem('access');
        localStorage.removeItem('refresh'); // If stored
    } catch (error) {
        console.error('Logout failed:', error);
        // Even if backend logout fails, clear frontend tokens
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
    }
};

/**
 * Refresh tokens
 */
export const refresh = async (refreshToken) => {
    try {
        const response = await apiClient.post('auth/refresh/', {
            refresh: refreshToken,
        });
        return response.data;
    } catch (error) {
        console.error('Token refresh failed:', error);
        throw error;
    }
};

/**
 * Verify token
 */
export const verify = async (token) => {
    try {
        const response = await apiClient.post('auth/verify/', {
            token: token,
        });
        return response.data;
    } catch (error) {
        console.error('Token verification failed:', error);
        throw error;
    }
};