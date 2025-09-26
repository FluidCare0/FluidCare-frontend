import React from 'react';
import { Link } from 'react-router-dom';

const getStatus = (percentage, thresholds) => {
    if (percentage < thresholds.low) return { color: 'bg-red-500', label: 'Critical Low' };
    if (percentage > thresholds.high) return { color: 'bg-red-500', label: 'Critical High' };
    if (percentage < thresholds.low + 10 || percentage > thresholds.high - 10) return { color: 'bg-yellow-500', label: 'Warning' };
    return { color: 'bg-green-500', label: 'Normal' };
};

const getStatusTextColor = (statusColor) => {
    if (statusColor === 'bg-red-500') return 'text-red-800';
    if (statusColor === 'bg-yellow-500') return 'text-yellow-800';
    return 'text-green-800';
}

const BedCard = ({ bed }) => {
    const { fluidBag, patient, bed_number, ward } = bed;
    const { type, current_level_ml, capacity_ml, threshold_low, threshold_high } = fluidBag;
    const percentage = Math.round((current_level_ml / capacity_ml) * 100);
    const status = getStatus(percentage, {
        low: (threshold_low / capacity_ml) * 100,
        high: (threshold_high / capacity_ml) * 100,
    });
    
    return (
        <Link to={`/patient/${bed.id}`} className="block bg-white rounded-lg shadow-md p-4 transition-transform transform hover:-translate-y-1 hover:shadow-lg">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-gray-800">Bed {bed_number}</h3>
                <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${status.color}`}>
                    {status.label}
                </span>
            </div>
            <div className="mb-4">
                <p className="text-gray-700">{patient.name}</p>
                <p className="text-sm text-gray-500">{ward.name}</p>
            </div>
            <div className="mb-2">
                <p className={`text-sm font-semibold ${getStatusTextColor(status.color)}`}>
                    {type} Bag: {current_level_ml.toFixed(0)} / {capacity_ml} mL
                </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className={`${status.color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </Link>
    );
};
export default BedCard;