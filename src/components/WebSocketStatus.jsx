import React, { useState, useEffect } from 'react';
import { sensorWebSocket } from '../api/websocket';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const WebSocketStatus = ({ label }) => {
    const [status, setStatus] = useState(sensorWebSocket.isConnected() ? 'connected' : 'disconnected');

    useEffect(() => {
        const handleConnectionChange = (data) => {
            setStatus(data.status); // 'connected', 'failed', 'closed', 'disconnected'
        };

        // Initial state logic
        if (sensorWebSocket.isConnected()) {
            setStatus('connected');
        } else if (sensorWebSocket.isConnectingOrConnected()) {
            setStatus('connecting');
        }

        sensorWebSocket.on('connection', handleConnectionChange);

        return () => {
            sensorWebSocket.off('connection', handleConnectionChange);
        };
    }, []);

    let icon, bgColor, textColor, textString;

    switch (status) {
        case 'connected':
            icon = <Wifi className="w-3.5 h-3.5" />;
            bgColor = 'bg-emerald-50 border-emerald-200';
            textColor = 'text-emerald-700';
            textString = 'Live';
            break;
        case 'connecting':
        case 'failed':
            icon = <RefreshCw className="w-3.5 h-3.5 animate-spin" />;
            bgColor = 'bg-amber-50 border-amber-200';
            textColor = 'text-amber-700';
            textString = 'Reconnecting...';
            break;
        case 'closed':
            icon = <WifiOff className="w-3.5 h-3.5" />;
            bgColor = 'bg-slate-200 border-slate-300';
            textColor = 'text-slate-700';
            textString = 'Inactive';
            break;
        default:
            icon = <WifiOff className="w-3.5 h-3.5" />;
            bgColor = 'bg-rose-50 border-rose-200';
            textColor = 'text-rose-700';
            textString = 'Disconnected';
    }

    return (
        <div title={`WebSocket Status: ${status}`} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-sm transition-all duration-300 ${bgColor} ${textColor}`}>
            {icon}
            {label && <span className="text-[10px] font-bold uppercase tracking-wide mr-0.5 opacity-75">{label}:</span>}
            <span className="text-[10px] font-bold uppercase tracking-wide">{textString}</span>
        </div>
    );
};

export default WebSocketStatus;
