// src/api/deviceApi.js
import apiClient from './api';

/**
 * Fetch all devices with current assignments
 */
export const getAllDevices = async () => {
    try {
        const response = await apiClient.get('sensor/devices/');
        // This now filters out removed devices
        return response.data;
    } catch (error) {
        console.error('Error fetching devices:', error);
        throw error;
    }
};

/**
 * Register a new device
 */
export const registerDevice = async (deviceData) => {
    try {
        const response = await apiClient.post('/register-device/', deviceData);
        return response.data;
    } catch (error) {
        console.error('Error registering device:', error);
        throw error;
    }
};

// --- NEW FUNCTIONS FOR DEVICE INFO PAGE ---

/**
 * Fetch detailed patient information for the patient currently assigned to a device.
 */
export const getPatientDetailsByDevice = async (deviceId) => {
    try {
        const response = await apiClient.get(`sensor/devices/${deviceId}/patient-details/`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching patient details for device ${deviceId}:`, error);
        throw error;
    }
};

/**
 * Fetch patient bed assignment history for the patient currently assigned to a device.
 */
export const getPatientAssignmentHistoryByDevice = async (deviceId) => {
    try {
        const response = await apiClient.get(`sensor/devices/${deviceId}/patient-history/`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching patient assignment history for device ${deviceId}:`, error);
        throw error;
    }
};

/**
 * Fetch device bed assignment history for a specific device.
 */
export const getDeviceAssignmentHistory = async (deviceId) => {
    try {
        const response = await apiClient.get(`sensor/devices/${deviceId}/device-history/`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching device assignment history for device ${deviceId}:`, error);
        throw error;
    }
};

/**
 * Fetch sensor reading history for a device.
 */
export const getSensorHistory = async (deviceId, hours = 24) => {
    try {
        const response = await apiClient.get(`sensor/devices/${deviceId}/history/`, {
            params: { hours }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching sensor history for device ${deviceId}:`, error);
        throw error;
    }
};

// Add other device-specific API calls here if needed