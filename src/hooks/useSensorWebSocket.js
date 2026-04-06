import { useEffect, useCallback, useRef } from 'react';
import { sensorWebSocket } from '../api/websocket';

export const useSensorWebSocket = ({
  onSensorData,
  onConnectionChange,
  onError,
  onNodeRequest,
  onDevicesRefresh,   // ← NEW
  autoConnect = true,
} = {}) => {
  const handlersRef = useRef({
    onSensorData,
    onConnectionChange,
    onError,
    onNodeRequest,
    onDevicesRefresh,  // ← NEW
  });

  useEffect(() => {
    handlersRef.current = {
      onSensorData,
      onConnectionChange,
      onError,
      onNodeRequest,
      onDevicesRefresh,
    };
  }, [onSensorData, onConnectionChange, onError, onNodeRequest, onDevicesRefresh]);

  const handleNodeRequest = useCallback((data) => {
    handlersRef.current.onNodeRequest?.(data);
  }, []);

  const handleSensorData = useCallback((data) => {
    handlersRef.current.onSensorData?.(data);
  }, []);

  const handleConnectionStatus = useCallback((data) => {
    handlersRef.current.onConnectionChange?.(data);
  }, []);

  const handleError = useCallback((data) => {
    handlersRef.current.onError?.(data);
  }, []);

  const handleDevicesRefresh = useCallback((data) => {
    handlersRef.current.onDevicesRefresh?.(data);
  }, []);

  const subscribeToFloor = useCallback((floorNumber) => {
    sensorWebSocket.subscribeToFloor(floorNumber);
  }, []);

  const unsubscribeFromFloor = useCallback((floorNumber) => {
    sensorWebSocket.unsubscribeFromFloor(floorNumber);
  }, []);

  const connect = useCallback(() => {
    sensorWebSocket.connect();
  }, []);

  const disconnect = useCallback(() => {
    sensorWebSocket.disconnect();
  }, []);

  const isConnected = useCallback(() => sensorWebSocket.isConnected(), []);

  useEffect(() => {
    sensorWebSocket.on('sensor_data', handleSensorData);
    sensorWebSocket.on('connection', handleConnectionStatus);
    sensorWebSocket.on('node_id_request', handleNodeRequest);
    sensorWebSocket.on('refresh_devices', handleDevicesRefresh);  // ← NEW
    sensorWebSocket.on('error', handleError);

    if (autoConnect) {
      sensorWebSocket.connect();
    }

    return () => {
      sensorWebSocket.off('sensor_data', handleSensorData);
      sensorWebSocket.off('connection', handleConnectionStatus);
      sensorWebSocket.off('node_id_request', handleNodeRequest);
      sensorWebSocket.off('refresh_devices', handleDevicesRefresh);  // ← NEW
      sensorWebSocket.off('error', handleError);
    };
  }, [
    autoConnect,
    handleSensorData,
    handleConnectionStatus,
    handleError,
    handleNodeRequest,
    handleDevicesRefresh,
  ]);

  return {
    connect,
    disconnect,
    isConnected,
    subscribeToFloor,
    unsubscribeFromFloor,
  };
};

export default useSensorWebSocket;