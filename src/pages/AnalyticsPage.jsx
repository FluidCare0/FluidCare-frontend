import React from 'react';
import Card from '../components/Card';

const AnalyticsPage = () => {
    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Device Usage</h3>
                    <p className="text-gray-600">Analytics charts will appear here</p>
                </Card>
                <Card className="p-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Patient Statistics</h3>
                    <p className="text-gray-600">Statistics will appear here</p>
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsPage;