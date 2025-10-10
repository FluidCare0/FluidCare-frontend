import React from 'react';

const BedTile = ({ bed, onClick }) => {
    // Calculate occupancy status based on is_occupied field
    const current = bed.is_occupied ? 1 : 0;
    const capacity = 1; // Since each bed can only be occupied or not

    const getBedStatus = (current, capacity) => {
        if (current === 0) return 'empty';
        if (current >= capacity) return 'full';
        if (current >= capacity * 0.75) return 'nearly-full';
        return 'available';
    };

    const getBedColor = (status) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 border-green-300 text-green-800';
            case 'nearly-full':
                return 'bg-orange-100 border-orange-300 text-orange-800';
            case 'full':
                return 'bg-red-100 border-red-300 text-red-800';
            case 'empty':
                return 'bg-gray-100 border-gray-300 text-gray-800';
            default:
                return 'bg-gray-100 border-gray-300 text-gray-800';
        }
    };

    const status = getBedStatus(current, capacity);
    const isFull = current >= capacity;

    return (
        <div
            onClick={() => onClick(bed)}
            className={`
                relative cursor-pointer transition-all hover:shadow-md
                ${getBedColor(status)}
                ${bed.shape === 'circular' ? 'w-24 h-24 flex items-center justify-center rounded-full mx-auto' : 'w-24 h-24 flex items-center justify-center rounded-lg'}
            `}
        >
            <div className="text-center">
                <div className="font-semibold text-sm mb-1">
                    {bed.bed_number}
                </div>
                <div className="text-xs font-medium">
                    {current}/{capacity}
                </div>
                {isFull && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        !
                    </div>
                )}
            </div>
        </div>
    );
};

export default BedTile;