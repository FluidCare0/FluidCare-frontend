// src/api/helperFunctions.js

// ==================== HELPER FUNCTIONS ====================

/**
 * Transforms backend device data for frontend use.
 * ✅ FIXED: Properly maps all fields from backend to frontend
 * @param {Object} backendDevice - Device object from the backend API.
 * @returns {Object} Transformed device object for the frontend.
 */
/**
 * Transforms backend device data for frontend use.
 * ✅ Supports both assignment-style and flat device responses
 */
export const transformDeviceData = (backendDevice) => {
    // 🧠 Check if data comes from the new assignment-style response
    const isAssignmentFormat = backendDevice.device !== undefined;

    // If new format (patient-device-bed assignment)
    if (isAssignmentFormat) {
        const fluidBag = backendDevice.device?.fluid_bags?.[0] || {};

        return {
            id: backendDevice.device?.id,
            nodeId: backendDevice.device?.id,
            name: backendDevice.patient_name || 'Unassigned',
            macAddress: backendDevice.device?.mac_address || 'N/A',
            status: backendDevice.device?.status ? 'active' : 'inactive',

            // 💧 Fluid Info
            fluidBag: {
                type: fluidBag.type || 'Unknown',
                capacity: fluidBag.capacity_ml || 0,
                thresholdLow: fluidBag.threshold_low || 0,
                thresholdHigh: fluidBag.threshold_high || 0,
            },

            // 🏥 Location Info
            patient: backendDevice.patient_name || 'Unassigned',
            bed: backendDevice.bed_number ? `Bed ${backendDevice.bed_number}` : 'N/A',
            ward: backendDevice.ward_name || 'N/A',
            floor: backendDevice.floor_number
                ? `Floor ${backendDevice.floor_number}`
                : 'N/A',

            // 🕒 Meta Info
            lastReading: backendDevice.start_time || null,
            level: 0, // Real-time readings will update via WebSocket
            batteryPercent: 100,
            stopAt: backendDevice.device?.stop_at || null,
        };
    }

    // If old format (flat device list)
    let status = backendDevice.status || 'offline';
    return {
        id: backendDevice.id,
        nodeId: backendDevice.nodeId || backendDevice.id,
        name: backendDevice.name || `Device ${backendDevice.mac_address?.slice(-8)}`,
        macAddress: backendDevice.mac_address,
        wardNo: backendDevice.current_ward_number || 'N/A',
        wardName: backendDevice.current_ward_name || 'Unassigned',
        roomNo: backendDevice.current_bed_number || 'N/A',
        patient: backendDevice.current_patient || 'No Patient',
        status,
        fluidBag: backendDevice.fluidBag ? {
            type: backendDevice.fluidBag.type,
            capacity: backendDevice.fluidBag.capacity_ml,
            thresholdLow: backendDevice.fluidBag.threshold_low,
            thresholdHigh: backendDevice.fluidBag.threshold_high
        } : null,
        level: backendDevice.level || 0,
        lastReading: backendDevice.lastReading || null,
        batteryPercent: backendDevice.batteryPercent || null,
        stopAt: backendDevice.stop_at,
        current_ward_number: backendDevice.current_ward_number,
        current_ward_name: backendDevice.current_ward_name,
        current_bed_number: backendDevice.current_bed_number,
        current_patient: backendDevice.current_patient,
    };
};


export const processSensorData = (sensorData) => {
    return {
        nodeId: sensorData.nodeId, // ✅ UUID from WebSocket
        nodeMac: sensorData.nodeMac,
        reading: sensorData.level, // ✅ Current reading level
        batteryPercent: sensorData.batteryPercent,
        timestamp: sensorData.timestamp ? new Date(sensorData.timestamp) : new Date(),
        status: sensorData.status || 'active', // ✅ Status from WebSocket (defaults to active)
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
    const { thresholdLow, thresholdHigh } = fluidBag;
    if (reading <= thresholdLow) return 'critical';
    if (reading <= thresholdLow * 1.2) return 'warning';
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
        statusLower === 'inactive' ||
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
        statusLower === 'task completed' ||
        statusLower === 'inactive';
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
        case 'inactive':
            return 'Task Completed';
        case 'disconnected':
            return 'Disconnected';
        default:
            return status;
    }
};