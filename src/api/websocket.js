// src/api/websocket.js

const WS_BASE_URL = 'ws://localhost:8000'; // Or use an environment variable

class SensorWebSocket {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.listeners = new Map();
        this.isConnecting = false;
        this.shouldReconnect = false;
        this.connectAbortController = null;
    }

    connect() {
        // Check connection state and prevent multiple attempts
        if (this.ws?.readyState === WebSocket.OPEN) {
            console.log('WebSocket is already connected');
            this.notifyListeners('connection', { status: 'connected' });
            return;
        }
        if (this.ws?.readyState === WebSocket.CONNECTING || this.isConnecting) {
            console.log('WebSocket connection attempt already in progress');
            return;
        }

        // Cancel any previous connect attempt
        if (this.connectAbortController) {
            this.connectAbortController.abort();
        }
        this.connectAbortController = new AbortController();

        this.isConnecting = true;
        this.shouldReconnect = true;

        const token = localStorage.getItem('access');
        if (!token) {
            console.error('No access token found for WebSocket connection.');
            this.isConnecting = false;
            return;
        }

        const wsUrl = `${WS_BASE_URL}/ws/sensors/?token=${token}`;

        try {
            if (this.connectAbortController.signal.aborted) {
                console.log("Connection attempt aborted before WebSocket creation.");
                this.isConnecting = false;
                return;
            }

            this.ws = new WebSocket(wsUrl);

            // Listen for abort signal
            const abortHandler = () => {
                console.log("Abort signal received, closing WebSocket connection attempt.");
                if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
                    this.ws.close(1000, "Connection attempt aborted by client");
                }
            };
            this.connectAbortController.signal.addEventListener('abort', abortHandler);

            this.ws.onopen = () => {
                console.log('✅ WebSocket Connected');
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                this.connectAbortController = null;
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
            };

            this.ws.onclose = (event) => {
                console.log('🔌 WebSocket Disconnected:', event.code, event.reason);
                this.isConnecting = false;
                this.ws = null;
                this.connectAbortController = null;

                let status = 'disconnected';
                if (event.code === 1000) {
                    status = 'closed';
                } else if (event.code === 1006) {
                    status = 'failed';
                }
                this.notifyListeners('connection', { status, code: event.code, reason: event.reason });

                // Only reconnect if we should and haven't exceeded max attempts
                if (this.shouldReconnect && status !== 'closed' && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.handleReconnect();
                }
            };
        } catch (error) {
            console.error('Failed to create WebSocket instance:', error);
            this.isConnecting = false;
            this.connectAbortController = null;
            this.notifyListeners('connection', { status: 'failed', message: 'Failed to initialize WebSocket connection.' });

            if (this.shouldReconnect) {
                this.handleReconnect();
            }
        }
    }

    handleMessage(data) {
        const { type, message } = data;

        switch (type) {
            case 'connection_established':
                console.log('Connection established message received:', message);
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
        if (this.reconnectAttempts < this.maxReconnectAttempts && this.shouldReconnect) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
        } else {
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnection attempts reached');
                this.notifyListeners('connection', {
                    status: 'failed',
                    message: 'Unable to reconnect to server after maximum attempts'
                });
            }
        }
    }

    disconnect() {
        console.log("Disconnect called on SensorWebSocket");
        this.shouldReconnect = false;

        // Abort any pending connection attempt
        if (this.connectAbortController) {
            console.log("Aborting pending connection attempt.");
            this.connectAbortController.abort();
            this.connectAbortController = null;
        }

        // Reset the connecting flag immediately to allow future connections
        this.isConnecting = false;

        if (this.ws) {
            const currentWs = this.ws;
            this.ws = null; // Clear reference immediately

            // Set a temporary onclose to avoid triggering handleReconnect
            currentWs.onclose = (event) => {
                console.log('Explicitly closed WebSocket:', event.code, event.reason);
                this.notifyListeners('connection', { status: 'closed', code: event.code, reason: event.reason });
            };
            currentWs.close(1000, "Client disconnected");
        } else {
            console.log("WebSocket connection attempt was pending, reset complete.");
        }
    }

    isConnected() {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    isConnectingOrConnected() {
        return this.isConnecting || this.isConnected();
    }
}

export const sensorWebSocket = new SensorWebSocket();