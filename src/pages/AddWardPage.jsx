import React, { useState } from 'react';
import Card from '../components/Card';

const AddWardPage = () => {
    // Mock data matching your database structure
    const [floors, setFloors] = useState([
        {
            id: 1,
            floor_number: 1,
            name: "Main Floor",
            description: "Main floor with ICU and Emergency wards",
            wards: [
                {
                    id: 1,
                    floor: 1,
                    ward_number: 1,
                    name: "ICU",
                    description: "Intensive Care Unit",
                    beds: [
                        { id: 1, ward: 1, bed_number: 1, is_occupied: true },
                        { id: 2, ward: 1, bed_number: 2, is_occupied: true },
                        { id: 3, ward: 1, bed_number: 3, is_occupied: false },
                    ]
                },
                {
                    id: 2,
                    floor: 1,
                    ward_number: 2,
                    name: "Emergency",
                    description: "Emergency Department",
                    beds: [
                        { id: 4, ward: 2, bed_number: 4, is_occupied: false },
                        { id: 5, ward: 2, bed_number: 5, is_occupied: true },
                    ]
                }
            ]
        },
        {
            id: 2,
            floor_number: 2,
            name: "Second Floor",
            description: "Second floor with General Wards",
            wards: [
                {
                    id: 3,
                    floor: 2,
                    ward_number: 3,
                    name: "General Ward A",
                    description: "General patient care",
                    beds: [
                        { id: 6, ward: 3, bed_number: 6, is_occupied: false },
                        { id: 7, ward: 3, bed_number: 7, is_occupied: true },
                    ]
                },
                {
                    id: 4,
                    floor: 2,
                    ward_number: 4,
                    name: "General Ward B",
                    description: "General patient care",
                    beds: [
                        { id: 8, ward: 4, bed_number: 8, is_occupied: true },
                        { id: 9, ward: 4, bed_number: 9, is_occupied: false },
                    ]
                }
            ]
        }
    ]);

    const [showAddModal, setShowAddModal] = useState({ type: null, visible: false });
    const [newItem, setNewItem] = useState({
        floor_name: '',
        ward_name: '',
        bed_number: '',
        floor_id: null,
        ward_id: null
    });

    const handleAddFloor = () => {
        const newFloor = {
            id: floors.length + 1,
            floor_number: floors.length + 1,
            name: newItem.floor_name || `Floor ${floors.length + 1}`,
            description: `Floor ${floors.length + 1}`,
            wards: []
        };
        setFloors([...floors, newFloor]);
        setNewItem({ ...newItem, floor_name: '' });
        setShowAddModal({ type: null, visible: false });
    };

    const handleAddWard = (floorId) => {
        const floor = floors.find(f => f.id === floorId);
        const newWard = {
            id: Math.max(...floors.flatMap(f => f.wards.map(w => w.id))) + 1,
            floor: floorId,
            ward_number: floor.wards.length + 1,
            name: newItem.ward_name || `Ward ${floor.wards.length + 1}`,
            description: `Ward ${floor.wards.length + 1}`,
            beds: []
        };
        setFloors(floors.map(floor =>
            floor.id === floorId
                ? { ...floor, wards: [...floor.wards, newWard] }
                : floor
        ));
        setNewItem({ ...newItem, ward_name: '' });
        setShowAddModal({ type: null, visible: false });
    };

    const handleAddBed = (wardId) => {
        const newBed = {
            id: Math.max(...floors.flatMap(f => f.wards.flatMap(w => w.beds.map(b => b.id)))) + 1,
            ward: wardId,
            bed_number: 1,
            is_occupied: false
        };
        setFloors(floors.map(floor => ({
            ...floor,
            wards: floor.wards.map(ward =>
                ward.id === wardId
                    ? { ...ward, beds: [...ward.beds, newBed] }
                    : ward
            )
        })));
        setShowAddModal({ type: null, visible: false });
    };

    const handleDeleteFloor = (floorId) => {
        setFloors(floors.filter(floor => floor.id !== floorId));
    };

    const handleDeleteWard = (wardId) => {
        setFloors(floors.map(floor => ({
            ...floor,
            wards: floor.wards.filter(ward => ward.id !== wardId)
        })));
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Hospital Bed Management</h2>

            {/* Add Floor Button */}
            <div className="mb-6">
                <button
                    onClick={() => setShowAddModal({ type: 'floor', visible: true })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                    Add Floor
                </button>
            </div>

            {/* Floor Sections */}
            <div className="space-y-6">
                {floors.map(floor => (
                    <div key={floor.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-xl text-gray-800">{floor.name}</span>
                                <button
                                    onClick={() => {
                                        setNewItem({ ...newItem, floor_id: floor.id });
                                        setShowAddModal({ type: 'ward', visible: true });
                                    }}
                                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Ward
                                </button>
                            </div>
                            <button
                                onClick={() => handleDeleteFloor(floor.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995 5.11L5 12m2 0l2-2h2l2 2" />
                                </svg>
                                Delete
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {floor.wards.map(ward => (
                                <div key={ward.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-medium text-lg text-gray-800">{ward.name}</span>
                                        <button
                                            onClick={() => {
                                                setNewItem({ ...newItem, ward_id: ward.id });
                                                setShowAddModal({ type: 'bed', visible: true });
                                            }}
                                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add BED
                                        </button>
                                    </div>

                                    {/* Bed List */}
                                    <div className="space-y-2">
                                        {ward.beds.map(bed => (
                                            <div key={bed.id} className={`p-2 rounded-md text-sm ${bed.is_occupied
                                                    ? 'bg-red-100 border-red-300 text-red-800'
                                                    : 'bg-green-100 border-green-300 text-green-800'
                                                }`}>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${bed.is_occupied ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                    <span>Bed {bed.bed_number}</span>
                                                    <span className="ml-auto text-xs font-medium">
                                                        {bed.is_occupied ? 'Occupied' : 'Available'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            {showAddModal.visible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {showAddModal.type === 'floor' ? 'Add New Floor' : showAddModal.type === 'ward' ? 'Add New Ward' : 'Add New Bed'}
                        </h3>

                        <div className="space-y-4">
                            {showAddModal.type === 'floor' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Floor Name</label>
                                    <input
                                        type="text"
                                        value={newItem.floor_name}
                                        onChange={(e) => setNewItem({ ...newItem, floor_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter floor name"
                                    />
                                </div>
                            )}

                            {showAddModal.type === 'ward' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ward Name</label>
                                    <input
                                        type="text"
                                        value={newItem.ward_name}
                                        onChange={(e) => setNewItem({ ...newItem, ward_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter ward name"
                                    />
                                </div>
                            )}

                            {showAddModal.type === 'bed' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bed Number</label>
                                    <input
                                        type="number"
                                        value={newItem.bed_number}
                                        onChange={(e) => setNewItem({ ...newItem, bed_number: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter bed number"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal({ type: null, visible: false })}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (showAddModal.type === 'floor') {
                                        handleAddFloor();
                                    } else if (showAddModal.type === 'ward') {
                                        handleAddWard(newItem.floor_id);
                                    } else if (showAddModal.type === 'bed') {
                                        handleAddBed(newItem.ward_id);
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add {showAddModal.type === 'floor' ? 'Floor' : showAddModal.type === 'ward' ? 'Ward' : 'Bed'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddWardPage;