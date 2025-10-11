// src/api/api.js
import axios from 'axios';

// ==================== CONFIGURATION ====================
const API_BASE_URL = 'http://localhost:8000';
const WS_BASE_URL = 'ws://localhost:8000';

// Axios instance with credentials (for refresh token in HTTP-only cookie)
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== TOKEN REFRESH LOGIC ====================
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
apiClient.interceptors.request.use((config) => {
  const access = localStorage.getItem('access');
  if (access) {
    config.headers['Authorization'] = `Bearer ${access}`;
  }
  return config;
});

// Response interceptor → auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${API_BASE_URL}/api/auth/refresh/`,
          {},
          { withCredentials: true }
        );

        const newAccess = res.data.access;
        localStorage.setItem('access', newAccess);

        processQueue(null, newAccess);

        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        localStorage.removeItem('access');

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

// ==================== API METHODS ====================

/**
 * Fetch all devices with current assignments
 */
export const getAllDevices = async () => {
  try {
    const response = await apiClient.get('sensor/devices/');
    return response.data;
  } catch (error) {
    console.error('Error fetching devices:', error);
    throw error;
  }
};

/**
 * Get sensor reading history for a device
 */
export const getSensorHistory = async (deviceId, hours = 24) => {
  try {
    const response = await apiClient.get(`/sensor-history/${deviceId}/?hours=${hours}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sensor history:', error);
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

// ==================== WEBSOCKET CLASS ====================

class SensorWebSocket {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.listeners = new Map();
    this.isConnecting = false;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    this.isConnecting = true;
    const token = localStorage.getItem('access'); // Use 'access' token for WS auth
    const wsUrl = `${WS_BASE_URL}/ws/sensors/?token=${token}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket Connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.notifyListeners('connection', { status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket Error:', error);
        this.isConnecting = false;
        this.notifyListeners('error', { error });
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket Disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.notifyListeners('connection', { status: 'disconnected' });
        this.handleReconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  handleMessage(data) {
    const { type, message } = data;

    switch (type) {
      case 'connection_established':
        console.log('Connection established:', message);
        break;
      case 'sensor_data':
        this.notifyListeners('sensor_data', message);
        break;
      case 'subscription_confirmed':
        console.log('Subscription confirmed for floor:', data.floor);
        this.notifyListeners('subscription', data);
        break;
      default:
        console.log('Unknown message type:', type);
        this.notifyListeners('message', data);
    }
  }

  subscribeToFloor(floorNumber) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe_floor', floor: floorNumber }));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  unsubscribeFromFloor(floorNumber) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe_floor', floor: floorNumber }));
    }
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      const callbacks = this.listeners.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  notifyListeners(eventType, data) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in listener callback:', error);
        }
      });
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      this.notifyListeners('connection', {
        status: 'failed',
        message: 'Unable to reconnect to server'
      });
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const sensorWebSocket = new SensorWebSocket();

// ==================== HELPER FUNCTIONS ====================

export const transformDeviceData = (backendDevice) => {
  return {
    id: backendDevice.id,
    deviceId: backendDevice.mac_address,
    wardNo: backendDevice.current_ward_number || 'N/A',
    wardName: backendDevice.current_ward_name || 'Unassigned',
    roomNo: backendDevice.current_bed_number || 'N/A',
    patient: backendDevice.current_patient || 'No Patient',
    status: backendDevice.status ? 'Activate' : 'Offline',
    fluidBag: backendDevice.fluidBag ? {
      type: backendDevice.fluidBag.type,
      capacity: backendDevice.fluidBag.capacity_ml,
      thresholdLow: backendDevice.fluidBag.threshold_low,
      thresholdHigh: backendDevice.fluidBag.threshold_high
    } : null,
    level: 0, // Updated via WebSocket
    lastReading: null
  };
};

export const processSensorData = (sensorData) => {
  return {
    nodeId: sensorData.node_id,
    nodeMac: sensorData.node_mac,
    reading: sensorData.reading,
    batteryPercent: sensorData.battery_percent,
    timestamp: new Date(sensorData.timestamp * 1000),
    date: sensorData.date,
    time: sensorData.time,
    via: sensorData.via,
    repeaterMac: sensorData.repeater_mac,
    masterMac: sensorData.master_mac
  };
};

export const calculateDeviceStatus = (reading, fluidBag) => {
  if (!fluidBag) return 'unknown';
  const { threshold_low, threshold_high } = fluidBag;
  if (reading <= threshold_low) return 'critical';
  if (reading <= threshold_low * 1.2) return 'warning';
  if (reading >= threshold_high) return 'overfill';
  return 'normal';
};

export default apiClient;