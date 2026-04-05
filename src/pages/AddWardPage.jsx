import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { hospitalApiService } from '../api/hospitalApi';

const initialModalState = {
    type: null,
    visible: false,
};

const initialDeleteState = {
    type: null,
    visible: false,
    id: null,
};

const initialNewItem = {
    floor_name: '',
    ward_name: '',
    bed_number: '',
    floor_id: null,
    ward_id: null,
};

const AddWardPage = () => {
    const [floors, setFloors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(initialModalState);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(initialDeleteState);
    const [newItem, setNewItem] = useState(initialNewItem);

    const fetchFloors = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await hospitalApiService.getAllFloors();
            setFloors(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load hospital structure:', err);
            setError('Failed to load hospital structure.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFloors();
    }, []);

    const resetModalState = () => {
        setShowAddModal(initialModalState);
        setNewItem(initialNewItem);
    };

    const handleAddFloor = async () => {
        try {
            const payload = {
                floor_number: floors.length + 1,
                name: newItem.floor_name || `Floor ${floors.length + 1}`,
                description: `Floor ${floors.length + 1}`,
            };

            await hospitalApiService.createFloor(payload);
            resetModalState();
            await fetchFloors();
        } catch (err) {
            console.error('Failed to add floor:', err);
            setError('Failed to add floor.');
        }
    };

    const handleAddWard = async () => {
        const floor = floors.find((item) => item.id === newItem.floor_id);

        if (!floor) {
            return;
        }

        try {
            const payload = {
                floor: newItem.floor_id,
                ward_number: floor.wards.length + 1,
                name: newItem.ward_name || `Ward ${floor.wards.length + 1}`,
                description: `Ward ${floor.wards.length + 1}`,
            };

            await hospitalApiService.createWard(payload);
            resetModalState();
            await fetchFloors();
        } catch (err) {
            console.error('Failed to add ward:', err);
            setError('Failed to add ward.');
        }
    };

    const handleAddBed = async () => {
        try {
            const payload = {
                ward: newItem.ward_id,
                bed_number: Number(newItem.bed_number) || 1,
                is_occupied: false,
            };

            await hospitalApiService.createBed(payload);
            resetModalState();
            await fetchFloors();
        } catch (err) {
            console.error('Failed to add bed:', err);
            setError('Failed to add bed.');
        }
    };

    const handleDeleteFloor = async (floorId) => {
        try {
            await hospitalApiService.deleteFloor(floorId);
            setShowDeleteConfirm(initialDeleteState);
            await fetchFloors();
        } catch (err) {
            console.error('Failed to delete floor:', err);
            setError('Failed to delete floor.');
        }
    };

    const handleDeleteWard = async (wardId) => {
        try {
            await hospitalApiService.deleteWard(wardId);
            setShowDeleteConfirm(initialDeleteState);
            await fetchFloors();
        } catch (err) {
            console.error('Failed to delete ward:', err);
            setError('Failed to delete ward.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="flex h-64 items-center justify-center text-lg text-gray-600">
                    Loading hospital structure...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Hospital Bed Management</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage floors, wards, and bed availability.
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal({ type: 'floor', visible: true })}
                    className="bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                    Add Floor
                </button>
            </div>

            {error && (
                <div className="mb-6 border border-red-300 bg-red-50 px-4 py-3 text-red-700">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                {floors.map((floor) => (
                    <Card key={floor.id} className="p-6">
                        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-800">
                                        {floor.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Floor {floor.floor_number}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setNewItem((current) => ({
                                            ...current,
                                            floor_id: floor.id,
                                        }));
                                        setShowAddModal({ type: 'ward', visible: true });
                                    }}
                                    className="bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700"
                                >
                                    Add Ward
                                </button>
                            </div>

                            <button
                                onClick={() =>
                                    setShowDeleteConfirm({
                                        type: 'floor',
                                        visible: true,
                                        id: floor.id,
                                    })
                                }
                                className="bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Delete Floor
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                            {floor.wards.map((ward) => (
                                <div key={ward.id} className="border border-gray-200 p-4">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-800">
                                                {ward.name}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Ward {ward.ward_number}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setNewItem((current) => ({
                                                    ...current,
                                                    ward_id: ward.id,
                                                }));
                                                setShowAddModal({ type: 'bed', visible: true });
                                            }}
                                            className="bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                                        >
                                            Add Bed
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {ward.beds.map((bed) => (
                                            <div
                                                key={bed.id}
                                                className={`flex items-center justify-between px-3 py-2 text-sm ${
                                                    bed.is_occupied
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-green-100 text-green-800'
                                                }`}
                                            >
                                                <span>Bed {bed.bed_number}</span>
                                                <span className="font-medium">
                                                    {bed.is_occupied ? 'Occupied' : 'Available'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() =>
                                            setShowDeleteConfirm({
                                                type: 'ward',
                                                visible: true,
                                                id: ward.id,
                                            })
                                        }
                                        className="mt-4 w-full bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                                    >
                                        Delete Ward
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            {showAddModal.visible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md bg-white p-6 shadow-2xl">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">
                            {showAddModal.type === 'floor'
                                ? 'Add New Floor'
                                : showAddModal.type === 'ward'
                                  ? 'Add New Ward'
                                  : 'Add New Bed'}
                        </h3>

                        <div className="space-y-4">
                            {showAddModal.type === 'floor' && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Floor Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newItem.floor_name}
                                        onChange={(event) =>
                                            setNewItem((current) => ({
                                                ...current,
                                                floor_name: event.target.value,
                                            }))
                                        }
                                        className="w-full border border-gray-300 px-3 py-2 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}

                            {showAddModal.type === 'ward' && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Ward Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newItem.ward_name}
                                        onChange={(event) =>
                                            setNewItem((current) => ({
                                                ...current,
                                                ward_name: event.target.value,
                                            }))
                                        }
                                        className="w-full border border-gray-300 px-3 py-2 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}

                            {showAddModal.type === 'bed' && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Bed Number
                                    </label>
                                    <input
                                        type="number"
                                        value={newItem.bed_number}
                                        onChange={(event) =>
                                            setNewItem((current) => ({
                                                ...current,
                                                bed_number: event.target.value,
                                            }))
                                        }
                                        className="w-full border border-gray-300 px-3 py-2 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={resetModalState}
                                className="bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (showAddModal.type === 'floor') {
                                        handleAddFloor();
                                    } else if (showAddModal.type === 'ward') {
                                        handleAddWard();
                                    } else {
                                        handleAddBed();
                                    }
                                }}
                                className="bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirm.visible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md bg-white p-6 shadow-2xl">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">Confirm Deletion</h3>
                        <p className="text-gray-600">
                            Are you sure you want to delete this {showDeleteConfirm.type}? This
                            action cannot be undone.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(initialDeleteState)}
                                className="bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (showDeleteConfirm.type === 'floor') {
                                        handleDeleteFloor(showDeleteConfirm.id);
                                    } else {
                                        handleDeleteWard(showDeleteConfirm.id);
                                    }
                                }}
                                className="bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddWardPage;
