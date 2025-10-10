import React from 'react';
import Card from './Card';

const DeviceCard = ({ device }) => {
    const getLevelColor = (level) => {
        if (level >= 70) return 'text-green-600';
        if (level >= 30) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-center mb-4 text-gray-800">IV Bottel</h3>

            <div className="flex items-start gap-4 mb-4">
                <div className={`w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center ${getLevelColor(device.level)} bg-gray-50`}>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{device.level}</div>
                        <div className="text-sm">%</div>
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

            <div className="text-center pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">Status : </span>
                <span className="text-sm font-bold text-gray-800">{device.status}</span>
            </div>
        </Card>
    );
};

export default DeviceCard;