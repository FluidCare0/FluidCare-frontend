import api from './api';

const NOTIFICATION_BASE_PATH = '/notification_app/notifications/';

const notificationApi = {
    getNotifications: async () => {
        const response = await api.get(NOTIFICATION_BASE_PATH);
        return response.data;
    },
    getNotificationHistory: async () => {
        const response = await api.get(`${NOTIFICATION_BASE_PATH}history/`);
        return response.data;
    },
    getAdminNotificationHistory: async () => {
        const response = await api.get(`${NOTIFICATION_BASE_PATH}admin-history/`);
        return response.data;
    },
    sendCustomNotification: async (payload) => {
        const response = await api.post(`${NOTIFICATION_BASE_PATH}send/`, payload);
        return response.data;
    },
    markAsRead: async (id) => {
        const response = await api.post(`${NOTIFICATION_BASE_PATH}${id}/read/`);
        return response.data;
    },
    markAllAsRead: async () => {
        const response = await api.post(`${NOTIFICATION_BASE_PATH}read-all/`);
        return response.data;
    },
    resolveNotification: async (id) => {
        const response = await api.post(`${NOTIFICATION_BASE_PATH}${id}/resolve/`);
        return response.data;
    }
};

export default notificationApi;

