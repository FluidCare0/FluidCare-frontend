import React from 'react';
import BedTile from './BedTile';

const WardSection = ({ ward, onBedClick }) => {
    return (
        <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{ward.name}</h3>
            <div className="grid grid-cols-6 gap-2">
                {ward.beds.map(bed => (
                    <div key={bed.id} className="flex justify-center">
                        <BedTile
                            bed={bed}
                            onClick={onBedClick}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

// Export BedTile as a static method so it can be used in FloorView
WardSection.BedTile = BedTile;

export default WardSection;