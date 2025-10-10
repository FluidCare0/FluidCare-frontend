import React from 'react';
import WardSection from './WardSection';

const FloorView = ({ floor, onBedClick, onAddBed, onAddWard }) => {
    return (
        <div className="relative bg-gray-50 rounded-lg p-6 min-h-96">
            {/* Hospital Floor Plan Layout */}
            <div className="grid grid-cols-12 gap-4">
                {/* Left Side - Wards */}
                <div className="col-span-8 space-y-6">
                    {floor.wards.map(ward => (
                        <div key={ward.id} className="bg-white rounded-lg p-4 shadow-sm border">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">{ward.name}</h3>
                            <div className="grid grid-cols-6 gap-2">
                                {ward.beds.map(bed => (
                                    <div key={bed.id} className="flex justify-center">
                                        <WardSection.BedTile
                                            bed={bed}
                                            onClick={onBedClick}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Side - Corridors and Common Areas */}
                <div className="col-span-4 space-y-4">
                    <div className="bg-gray-200 rounded-lg p-4 h-32 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-sm font-medium text-gray-700">Main Corridor</div>
                            <div className="text-xs text-gray-500">Floor {floor.floor_number}</div>
                        </div>
                    </div>

                    <div className="bg-blue-100 rounded-lg p-4 h-24 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-sm font-medium text-blue-700">Nurse Station</div>
                        </div>
                    </div>

                    <div className="bg-yellow-100 rounded-lg p-4 h-24 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-sm font-medium text-yellow-700">Supply Room</div>
                        </div>
                    </div>

                    <div className="bg-green-100 rounded-lg p-4 h-24 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-sm font-medium text-green-700">Elevators</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Bed Button */}
            <button
                onClick={() => onAddBed && onAddBed(floor.id)}
                className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </button>
        </div>
    );
};

export default FloorView;