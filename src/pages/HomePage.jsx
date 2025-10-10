import React, { useState, useEffect } from 'react';
import DeviceCard from '../components/DeviceCard';

// Test data for IV bottles
const generateTestData = () => [
    {
        id: 1,
        deviceId: "IV-001",
        wardNo: "ICU-A",
        roomNo: "101",
        patient: "John Doe",
        level: Math.floor(Math.random() * 100),
        status: "Activate"
    },
    {
        id: 2,
        deviceId: "IV-002",
        wardNo: "ICU-A",
        roomNo: "102",
        patient: "Jane Smith",
        level: Math.floor(Math.random() * 100),
        status: "Activate"
    },
    {
        id: 3,
        deviceId: "IV-003",
        wardNo: "Ward-1",
        roomNo: "201",
        patient: "Alice Johnson",
        level: Math.floor(Math.random() * 100),
        status: "Activate"
    },
    {
        id: 4,
        deviceId: "IV-004",
        wardNo: "Ward-1",
        roomNo: "202",
        patient: "Bob Wilson",
        level: Math.floor(Math.random() * 100),
        status: "Activate"
    },
    {
        id: 5,
        deviceId: "IV-005",
        wardNo: "Ward-2",
        roomNo: "301",
        patient: "Carol Davis",
        level: Math.floor(Math.random() * 100),
        status: "Activate"
    },
    {
        id: 6,
        deviceId: "IV-006",
        wardNo: "Ward-2",
        roomNo: "302",
        patient: "David Brown",
        level: Math.floor(Math.random() * 100),
        status: "Activate"
    }
];

const HomePage = () => {
    const [devices, setDevices] = useState(generateTestData());

    useEffect(() => {
        const interval = setInterval(() => {
            setDevices(generateTestData());
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Active Devices</h2>
                <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                    Add Devices
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map((device) => (
                    <DeviceCard key={device.id} device={device} />
                ))}
            </div>
        </div>
    );
};

export default HomePage;