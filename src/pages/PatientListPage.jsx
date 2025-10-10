import React from 'react';
import Card from '../components/Card';

const PatientListPage = () => {
    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Patient List</h2>
            <Card className="p-6">
                <p className="text-gray-600 text-center py-12">Patient list content will appear here</p>
            </Card>
        </div>
    );
};

export default PatientListPage;