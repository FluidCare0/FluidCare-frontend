import React from 'react';
import Card from './Card';

const DeviceCard = ({ device, onShowDetails, onDisconnect }) => {
    const isOffline = device.status.toLowerCase() === 'offline' || device.status.toLowerCase() === 'deactivate';

    const getLevelColor = (level) => {
        if (isOffline) return 'text-gray-500';
        if (level >= 70) return 'text-green-600';
        if (level >= 30) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getCircleColor = (level) => {
        if (isOffline) return '#9CA3AF'; // gray-400
        if (level >= 70) return '#10B981'; // green-500
        if (level >= 30) return '#F59E0B'; // yellow-500
        return '#EF4444'; // red-500
    };

    const getBgColor = (level) => {
        if (isOffline) return 'bg-gradient-to-r from-gray-100 to-gray-200';
        if (level >= 70) return 'bg-gradient-to-r from-green-50 to-green-100';
        if (level >= 30) return 'bg-gradient-to-r from-yellow-50 to-yellow-100';
        return 'bg-gradient-to-r from-red-50 to-red-100';
    };

    const getBorderColor = (level) => {
        if (isOffline) return 'border-gray-300';
        if (level >= 70) return 'border-green-200';
        if (level >= 30) return 'border-yellow-200';
        return 'border-red-200';
    };

    const getButtonClass = (level) => {
        if (isOffline) return 'bg-blue-500 hover:bg-blue-600 text-white';
        if (level >= 70) return 'bg-blue-500 hover:bg-blue-600 text-white';
        if (level >= 30) return 'bg-blue-500 hover:bg-blue-600 text-white';
        return 'bg-blue-500 hover:bg-blue-600 text-white';
    };

    const getDisconnectButtonClass = () => {
        if (isOffline) return 'bg-gray-400 hover:bg-gray-500 text-white cursor-not-allowed';
        return 'bg-red-500 hover:bg-red-600 text-white';
    };

    const radius = 36; // Radius of the circle
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (device.level / 100) * circumference;

    const handleMoreInfo = () => {
        if (onShowDetails) {
            onShowDetails(device);
        }
    };

    const handleDisconnect = (e) => {
        e.stopPropagation(); // Prevent triggering more info
        if (onDisconnect && !isOffline) {
            onDisconnect(device);
        }
    };

    return (
        <Card className={`p-6 hover:shadow-lg transition-shadow border-2 ${getBorderColor(device.level)} ${getBgColor(device.level)} ${isOffline ? 'opacity-70' : ''}`}>
            <h3 className="text-xl font-bold text-center mb-4 text-gray-800">IV Bottel</h3>

            <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-gray-200"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            stroke={getCircleColor(device.level)}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-500 ease-in-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className={`text-2xl font-bold ${getLevelColor(device.level)}`}>{device.level}</div>
                            <div className="text-sm text-gray-600">%</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 text-sm space-y-1">
                    <div className="text-gray-600">
                        <span className="font-medium text-gray-700">Device ID:</span> {device.deviceId}
                    </div>
                    <div className="text-gray-600">
                        <span className="font-medium text-gray-700">Ward No.:</span> {device.wardNo}
                    </div>
                    <div className="text-gray-600">
                        <span className="font-medium text-gray-700">Room No.:</span> {device.roomNo}
                    </div>
                    <div className="text-gray-600">
                        <span className="font-medium text-gray-700">Patient:</span> {device.patient}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <button
                    onClick={handleDisconnect}
                    disabled={isOffline}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${getDisconnectButtonClass()}`}
                >
                    {isOffline ? 'Offline' : 'Disconnect'}
                </button>
                <button
                    onClick={handleMoreInfo}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${getButtonClass(device.level)}`}
                >
                    More Info
                </button>
            </div>
        </Card>
    );
};

export default DeviceCard;