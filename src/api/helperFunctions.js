// src/api/helperFunctions.js

// ==================== HELPER FUNCTIONS ====================

/**
 * Transforms backend device data for frontend use.
 * @param {Object} backendDevice - Device object from the backend API.
 * @returns {Object} Transformed device object for the frontend.
 */
export const transformDeviceData = (backendDevice) => {
    // Determine status based on backend status and stop_at field
    let status = 'Offline'; // Default to Offline
    if (backendDevice.status && !backendDevice.stop_at) {
        // DB status is True and stop_at is not set -> Active
        status = 'Activate';
    } else if (backendDevice.stop_at) {
        // stop_at is set -> Task Completed (or stopped)
        status = 'Task_Completed'; // Or 'Stopped'
    }
    // If DB status is False and stop_at is not set, it's Offline due to timeout or other reasons

    return {
        id: backendDevice.id, // ✅ Primary identifier is the UUID
        deviceId: backendDevice.id, // ✅ Use the UUID as deviceId for consistency
        macAddress: backendDevice.mac_address, // ✅ Store MAC address separately
        wardNo: backendDevice.current_ward_number || 'N/A',
        wardName: backendDevice.current_ward_name || 'Unassigned',
        roomNo: backendDevice.current_bed_number || 'N/A',
        patient: backendDevice.current_patient || 'No Patient',
        status: status, // Use the calculated status
        fluidBag: backendDevice.fluidBag ? {
            type: backendDevice.fluidBag.type,
            capacity: backendDevice.fluidBag.capacity_ml,
            thresholdLow: backendDevice.fluidBag.threshold_low,
            thresholdHigh: backendDevice.fluidBag.threshold_high
        } : null,
        level: 0, // Updated via WebSocket
        lastReading: null,
        batteryPercent: null, // Updated via WebSocket
        stopAt: backendDevice.stop_at // Include stop_at timestamp
    };
};

export const processSensorData = (sensorData) => {
    return {
        nodeId: sensorData.nodeId,
        nodeMac: sensorData.nodeMac,
        reading: sensorData.level,
        smoothedWeight: sensorData.smoothedWeight ?? null,
        batteryPercent: sensorData.batteryPercent,
        timestamp: new Date(sensorData.timestamp),
        status: sensorData.status,
    };
};

/**
 * Calculates the alert status based on the current reading and thresholds.
 * @param {number} reading - Current sensor reading level.
 * @param {Object} fluidBag - Fluid bag object containing thresholds.
 * @returns {string} Alert status ('critical', 'warning', 'overfill', 'normal', 'unknown').
 */
export const calculateDeviceStatus = (reading, fluidBag) => {
    if (!fluidBag) return 'unknown';
    const { thresholdLow, thresholdHigh } = fluidBag; // Match keys from transformDeviceData
    if (reading <= thresholdLow) return 'critical';
    if (reading <= thresholdLow * 1.2) return 'warning'; // Example: warning slightly above low
    if (reading >= thresholdHigh) return 'overfill';
    return 'normal';
};

/**
 * Checks if a device is considered offline based on its status.
 * @param {string} status - Device status string.
 * @returns {boolean} True if the device is offline.
 */
export const isDeviceOffline = (status) => {
    if (!status) return true;
    const statusLower = status.toLowerCase();
    return statusLower === 'offline' ||
        statusLower === 'deactivate';
};

/**
 * Checks if a device is considered task-completed.
 * @param {string} status - Device status string.
 * @returns {boolean} True if the device is task-completed.
 */
export const isDeviceTaskCompleted = (status) => {
    if (!status) return false;
    const statusLower = status.toLowerCase();
    return statusLower === 'task_completed' ||
        statusLower === 'task completed';
};

/**
 * Checks if a device is active/online.
 * @param {string} status - Device status string.
 * @returns {boolean} True if the device is active.
 */
export const isDeviceActive = (status) => {
    if (!status) return false;
    const statusLower = status.toLowerCase();
    return statusLower === 'activate' ||
        statusLower === 'active' ||
        statusLower === 'online';
};

/**
 * Get human-readable status display text.
 * @param {string} status - Device status string.
 * @returns {string} Formatted status text for display.
 */
export const getStatusDisplayText = (status) => {
    if (!status) return 'Unknown';
    const statusLower = status.toLowerCase();

    switch (statusLower) {
        case 'activate':
        case 'active':
        case 'online':
            return 'Active';
        case 'offline':
        case 'deactivate':
            return 'Offline';
        case 'task_completed':
        case 'task completed':
            return 'Task Completed';
        case 'disconnected':
            return 'Disconnected';
        default:
            return status;
    }
};
