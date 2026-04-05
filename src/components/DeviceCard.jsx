// src/components/DeviceCard.js
import React from 'react';
import Card from './Card';
import { isDeviceOffline, isDeviceTaskCompleted } from '../api/helperFunctions';

const DeviceCard = ({ device, onShowDetails }) => {
    const isOffline = isDeviceOffline(device?.status);
    const isTaskCompleted = isDeviceTaskCompleted(device?.status);

    const getFluidBagTypeName = (type) => {
        const typeMap = {
            'iv_bag': 'IV Bag',
            'blood_bag': 'Blood Bag',
            'urine_bag': 'Urine Bag',
        };
        return typeMap[type] || 'IV Bottle';
    };

    // Alert status uses smoothed weight when available, falls back to raw level
    const getAlertStatus = () => {
        if (isOffline || isTaskCompleted) return 'offline';
        if (!device.fluidBag) return 'unknown';
        const { thresholdLow, thresholdHigh } = device.fluidBag;
        const alertValue = device.smoothedWeight ?? device.level ?? 0;
        if (alertValue <= thresholdLow) return 'critical';
        if (alertValue <= thresholdLow * 1.2) return 'warning';
        if (alertValue >= thresholdHigh) return 'overfill';
        return 'normal';
    };

    const alertStatus = getAlertStatus();

    const getLevelColor = (status) => {
        switch (status) {
            case 'offline': return 'text-gray-500';
            case 'critical': return 'text-red-600';
            case 'warning': return 'text-yellow-600';
            case 'overfill': return 'text-purple-600';
            case 'normal': return 'text-green-600';
            default: return 'text-gray-500';
        }
    };

    const getCircleColor = (status) => {
        switch (status) {
            case 'offline': return '#9CA3AF';
            case 'critical': return '#EF4444';
            case 'warning': return '#F59E0B';
            case 'overfill': return '#A855F7';
            case 'normal': return '#10B981';
            default: return '#9CA3AF';
        }
    };

    const getBgColor = (status) => {
        switch (status) {
            case 'offline': return 'bg-gradient-to-r from-gray-100 to-gray-200';
            case 'critical': return 'bg-gradient-to-r from-red-50 to-red-100';
            case 'warning': return 'bg-gradient-to-r from-yellow-50 to-yellow-100';
            case 'overfill': return 'bg-gradient-to-r from-purple-50 to-purple-100';
            case 'normal': return 'bg-gradient-to-r from-green-50 to-green-100';
            default: return 'bg-gradient-to-r from-gray-100 to-gray-200';
        }
    };

    const getBorderColor = (status) => {
        switch (status) {
            case 'offline': return 'border-gray-300';
            case 'critical': return 'border-red-300';
            case 'warning': return 'border-yellow-300';
            case 'overfill': return 'border-purple-300';
            case 'normal': return 'border-green-300';
            default: return 'border-gray-300';
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'offline': { bg: 'bg-gray-500', text: isTaskCompleted ? 'Task Completed' : 'Offline' },
            'critical': { bg: 'bg-red-500', text: 'Critical Low' },
            'warning': { bg: 'bg-yellow-500', text: 'Low' },
            'overfill': { bg: 'bg-purple-500', text: 'Overfill' },
            'normal': { bg: 'bg-green-500', text: 'Normal' },
        };
        return badges[status] || badges['offline'];
    };

    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const level = device?.level || 0;
    const strokeDashoffset = circumference - (level / 100) * circumference;

    const fluidBagType = device?.fluidBag?.type
        ? getFluidBagTypeName(device.fluidBag.type)
        : 'IV Bottle';
    const statusBadge = getStatusBadge(alertStatus);

    return (
        <Card
            className={`p-6 hover:shadow-lg transition-shadow border-2 ${getBorderColor(alertStatus)} ${getBgColor(alertStatus)} ${(isOffline || isTaskCompleted) ? 'opacity-70' : ''}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">{fluidBagType}</h3>
                <span className={`px-3 py-1 text-xs font-semibold text-white ${statusBadge.bg}`}>
                    {statusBadge.text}
                </span>
            </div>

            <div className="flex items-start gap-4 mb-4">
                {/* Circular progress ring */}
                <div className="relative flex-shrink-0">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200" />
                        <circle
                            cx="50" cy="50" r={radius}
                            stroke={getCircleColor(alertStatus)}
                            strokeWidth="8" fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-500 ease-in-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className={`text-2xl font-bold ${getLevelColor(alertStatus)}`}>{level}</div>
                            <div className="text-xs text-gray-600">%</div>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-sm space-y-1.5">
                    <div className="text-gray-600">
                        <span className="font-medium text-gray-700">Device ID:</span>{' '}
                        <span className="font-mono text-xs">{device?.id || 'N/A'}</span>
                    </div>
                    <div className="text-gray-600">
                        <span className="font-medium text-gray-700">Ward:</span>{' '}
                        {device?.ward || 'N/A'}
                    </div>
                    <div className="text-gray-600">
                        <span className="font-medium text-gray-700">Bed:</span>{' '}
                        {device?.bed || 'N/A'}
                    </div>
                    <div className="text-gray-600">
                        <span className="font-medium text-gray-700">Patient:</span>{' '}
                        {device?.patient || 'No Patient'}
                    </div>

                    {/* Smoothed weight (EWMA) */}
                    {device?.smoothedWeight != null && (
                        <div className="text-gray-600">
                            <span className="font-medium text-gray-700">Smoothed:</span>{' '}
                            <span className="font-semibold text-blue-600">
                                {device.smoothedWeight.toFixed(1)} g
                            </span>
                            <span className="text-xs text-gray-400 ml-1">(raw: {level})</span>
                        </div>
                    )}

                    {/* Battery */}
                    {device?.batteryPercent != null && (
                        <div className="text-gray-600 flex items-center gap-1">
                            <span className="font-medium text-gray-700">Battery:</span>
                            <span className={`font-semibold ${device.batteryPercent < 20 ? 'text-red-600' : 'text-gray-700'}`}>
                                {Math.round(device.batteryPercent)}%
                            </span>
                            {device.batteryPercent < 20 && (
                                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                    )}

                    {device?.lastReading && (
                        <div className="text-xs text-gray-500 mt-1">
                            Updated: {new Date(device.lastReading).toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </div>

            {/* Threshold row */}
            {device?.fluidBag && !(isOffline || isTaskCompleted) && (
                <div className="mb-3 p-2 bg-white bg-opacity-50 text-xs text-gray-600">
                    <div className="flex justify-between">
                        <span>Low: {device.fluidBag.thresholdLow}%</span>
                        <span>High: {device.fluidBag.thresholdHigh}%</span>
                        <span>Capacity: {device.fluidBag.capacity}ml</span>
                    </div>
                </div>
            )}

            {/* Action */}
            <div className="flex justify-end">
                <button
                    onClick={() => onShowDetails && onShowDetails(device)}
                    className="px-4 py-1.5 text-sm font-medium transition-colors bg-blue-500 hover:bg-blue-600 text-white"
                >
                    More Info
                </button>
            </div>
        </Card>
    );
};

export default DeviceCard;
