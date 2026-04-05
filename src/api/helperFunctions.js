export const transformDeviceData = (backendDevice) => {
    const isAssignmentFormat = backendDevice.device !== undefined;

    if (isAssignmentFormat) {
        const fluidBag = backendDevice.device?.fluid_bags?.[0] || {};

        return {
            id: backendDevice.device?.id,
            nodeId: backendDevice.device?.id,
            name: backendDevice.patient_name || 'Unassigned',
            macAddress: backendDevice.device?.mac_address || 'N/A',
            status: backendDevice.device?.status || 'offline',
            fluidBag: {
                type: fluidBag.type || 'Unknown',
                capacity: fluidBag.capacity_ml || 0,
                thresholdLow: fluidBag.threshold_low || 0,
                thresholdHigh: fluidBag.threshold_high || 0,
            },
            patient: backendDevice.patient_name || 'Unassigned',
            bed: backendDevice.bed_number ? `Bed ${backendDevice.bed_number}` : 'N/A',
            ward: backendDevice.ward_name || 'N/A',
            floor: backendDevice.floor_number ? `Floor ${backendDevice.floor_number}` : 'N/A',
            lastReading: backendDevice.start_time || null,
            level: 0,
            batteryPercent: 100,
            stopAt: backendDevice.device?.stop_at || null,
            current_ward_number: backendDevice.ward_number || 'N/A',
            current_ward_name: backendDevice.ward_name || 'Unassigned',
            current_bed_number: backendDevice.bed_number || 'N/A',
            current_patient: backendDevice.patient_name || 'No Patient',
        };
    }

    const status = backendDevice.status || 'offline';

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
        fluidBag: backendDevice.fluidBag
            ? {
                  type: backendDevice.fluidBag.type,
                  capacity: backendDevice.fluidBag.capacity_ml,
                  thresholdLow: backendDevice.fluidBag.threshold_low,
                  thresholdHigh: backendDevice.fluidBag.threshold_high,
              }
            : null,
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
        nodeId: sensorData.nodeId,
        nodeMac: sensorData.nodeMac,
        reading: sensorData.level,
        smoothedWeight: sensorData.smoothedWeight ?? null,
        batteryPercent: sensorData.batteryPercent,
        timestamp: sensorData.timestamp ? new Date(sensorData.timestamp) : new Date(),
        status: sensorData.status || 'active',
    };
};

export const calculateDeviceStatus = (reading, fluidBag) => {
    if (!fluidBag) {
        return 'unknown';
    }

    const { thresholdLow, thresholdHigh } = fluidBag;

    if (reading <= thresholdLow) {
        return 'critical';
    }

    if (reading <= thresholdLow * 1.2) {
        return 'warning';
    }

    if (reading >= thresholdHigh) {
        return 'overfill';
    }

    return 'normal';
};

export const isDeviceOffline = (status) => {
    if (!status) {
        return true;
    }

    const statusLower = status.toLowerCase();
    return statusLower === 'offline' || statusLower === 'inactive' || statusLower === 'deactivate';
};

export const isDeviceTaskCompleted = (status) => {
    if (!status) {
        return false;
    }

    const statusLower = status.toLowerCase();
    return (
        statusLower === 'task_completed' ||
        statusLower === 'task completed' ||
        statusLower === 'completed' ||
        statusLower === 'inactive'
    );
};

export const isDeviceActive = (status) => {
    if (!status) {
        return false;
    }

    const statusLower = status.toLowerCase();
    return statusLower === 'activate' || statusLower === 'active' || statusLower === 'online';
};

export const getStatusDisplayText = (status) => {
    if (!status) {
        return 'Unknown';
    }

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
