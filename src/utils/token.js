import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const refreshAccessToken = async () => {
    try {
        const res = await axios.post(
            `${API_BASE_URL}/api/auth/refresh/`,
            {},
            { withCredentials: true }
        );

        const newToken = res.data.access;
        localStorage.setItem('access', newToken);
        return newToken;
    } catch (error) {
        console.error('Token refresh failed:', error);
        localStorage.removeItem('access');
        return null;
    }
};

export const isTokenExpiringSoon = (token) => {
    if (!token) {
        return true;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = payload.exp - currentTime;
        return timeUntilExpiry < 30;
    } catch (error) {
        return true;
    }
};

export const ensureValidToken = async () => {
    const token = localStorage.getItem('access');

    if (!token || isTokenExpiringSoon(token)) {
        return refreshAccessToken();
    }

    return token;
};
