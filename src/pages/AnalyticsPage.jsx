import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Bed, TrendingUp, Calendar, User, Activity, Download, X, FileText } from 'lucide-react';

const AnalyticsPage = () => {
    const [timeRange, setTimeRange] = useState('week');
    const [activePatientsList, setActivePatientsList] = useState([]);
    const [allPatientsList, setAllPatientsList] = useState([]);
    const [showActivePatientsModal, setShowActivePatientsModal] = useState(false);
    const [showReportsPanel, setShowReportsPanel] = useState(false);
    const [isReportLoading, setIsReportLoading] = useState(false);

    // Updated report parameters
    const [reportParams, setReportParams] = useState({
        'all-patients-info': { dateRange: { start: '', end: '' } },
        'single-patient-info': { patientId: '' },
        'patient-bed-assignment': { dateRange: { start: '', end: '' }, patientId: '', bedId: '' },
    });

    const [patientKPIs, setPatientKPIs] = useState({
        totalPatients: 0,
        admittedPatients: 0,
        avgLengthOfStay: 0,
    });

    const [bedKPIs, setBedKPIs] = useState({
        totalBeds: 0,
        occupancyRate: 0,
        avgUtilization: 0,
        turnoverRate: 0,
    });

    const [admissionDischargeTrends, setAdmissionDischargeTrends] = useState([]);
    const [patientDistribution, setPatientDistribution] = useState({
        gender: [],
        floor: [],
        ageGroups: []
    });
    const [bedOccupancyByFloor, setBedOccupancyByFloor] = useState([]);
    const [bedUtilizationByWard, setBedUtilizationByWard] = useState([]);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            setPatientKPIs({
                totalPatients: 45,
                admittedPatients: 35,
                avgLengthOfStay: 4.2
            });
            setBedKPIs({
                totalBeds: 50,
                occupancyRate: 78,
                avgUtilization: 82,
                turnoverRate: 0.8
            });
            setAdmissionDischargeTrends([
                { date: 'Oct 1', admissions: 5, discharges: 3 },
                { date: 'Oct 2', admissions: 3, discharges: 4 },
                { date: 'Oct 3', admissions: 7, discharges: 2 },
                { date: 'Oct 4', admissions: 4, discharges: 5 },
                { date: 'Oct 5', admissions: 6, discharges: 3 },
                { date: 'Oct 6', admissions: 2, discharges: 6 },
                { date: 'Oct 7', admissions: 5, discharges: 4 },
            ]);
            setPatientDistribution({
                gender: [
                    { name: 'Male', value: 20, color: '#3b82f6' },
                    { name: 'Female', value: 25, color: '#ec4899' },
                ],
                floor: [
                    { name: 'Floor 1', value: 12, color: '#10b981' },
                    { name: 'Floor 2', value: 15, color: '#f59e0b' },
                    { name: 'Floor 3', value: 8, color: '#ef4444' }
                ],
                ageGroups: [
                    { name: '0-18', value: 3, color: '#6366f1' },
                    { name: '19-35', value: 10, color: '#8b5cf6' },
                    { name: '36-50', value: 15, color: '#a78bfa' },
                    { name: '51-65', value: 12, color: '#c084fc' },
                    { name: '65+', value: 5, color: '#d8b4fe' }
                ]
            });
            setBedOccupancyByFloor([
                { floor: 'Floor 1', occupied: 12, available: 8 },
                { floor: 'Floor 2', occupied: 15, available: 5 },
                { floor: 'Floor 3', occupied: 8, available: 2 },
            ]);
            setBedUtilizationByWard([
                { ward: 'Ward A', utilization: 85 },
                { ward: 'Ward B', utilization: 92 },
                { ward: 'Ward C', utilization: 70 },
                { ward: 'Ward D', utilization: 78 },
            ]);
            setActivePatientsList([
                { id: '1', name: 'John Doe', age: 45, gender: 'Male', ward: 'Ward A', bed: 'Bed 5', admitted_at: '2023-10-01' },
                { id: '2', name: 'Jane Smith', age: 32, gender: 'Female', ward: 'Ward B', bed: 'Bed 3', admitted_at: '2023-10-05' },
            ]);
            setAllPatientsList([
                { id: '1', name: 'John Doe' },
                { id: '2', name: 'Jane Smith' },
                { id: '3', name: 'Bob Johnson' },
                { id: '4', name: 'Alice Brown' },
            ]);
        };

        fetchAnalyticsData();
    }, [timeRange]);

    const handleActivePatientsClick = () => {
        setShowActivePatientsModal(true);
    };

    const handleParamChange = (reportType, field, value) => {
        setReportParams(prev => ({
            ...prev,
            [reportType]: {
                ...prev[reportType],
                [field]: value
            }
        }));
    };

    const handleDownloadReport = async (reportType) => {
        const params = reportParams[reportType];
        let isValid = true;
        let errorMsg = '';

        if (reportType === 'all-patients-info') {
            if (!params.dateRange.start || !params.dateRange.end) {
                errorMsg = 'Please select both start and end dates for the All Patients report.';
            }
        } else if (reportType === 'single-patient-info') {
            if (!params.patientId) {
                errorMsg = 'Please select a specific patient for the Single Patient report.';
            }
        } else if (reportType === 'patient-bed-assignment') {
            if (!params.patientId && !params.bedId && (!params.dateRange.start || !params.dateRange.end)) {
                errorMsg = 'Please select either a specific patient, a specific bed, or a date range for the Bed Assignment report.';
            }
        }

        if (errorMsg) {
            alert(errorMsg);
            return;
        }

        setIsReportLoading(true);
        try {
            console.log(`Downloading ${reportType} report with params:`, params);
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert(`Report download started successfully!`);
        } catch (error) {
            console.error('Error fetching report ', error);
            alert('Error generating report. Please try again.');
        } finally {
            setIsReportLoading(false);
        }
    };

    const KPICard = ({ title, value, icon: Icon, color, suffix = '', onClick, subtitle }) => (
        <div
            className={`bg-white rounded-lg shadow-sm p-6 border-l-4 transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}`}
            style={{ borderColor: color }}
            onClick={onClick}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}15` }}>
                    <Icon size={24} color={color} />
                </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
            <p className="text-3xl font-bold mb-1" style={{ color }}>
                {value}{suffix}
            </p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
    );

    const Modal = ({ isOpen, onClose, title, children }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        {children}
                    </div>
                </div>
            </div>
        );
    };

    const ReportsModal = () => (
        <Modal
            isOpen={showReportsPanel}
            onClose={() => setShowReportsPanel(false)}
            title="Download Reports"
        >
            <div className="space-y-6">
                <p className="text-gray-600 mb-6">Generate and download various hospital reports. Select specific filters or a date range.</p>

                {/* All Patients Information Report */}
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="text-blue-500" size={20} />
                        <h3 className="text-lg font-semibold text-gray-800">All Patients Information Report</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Download patient demographics, admission details, and medical history for all patients within a date range.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From Date *</label>
                            <input
                                type="date"
                                value={reportParams['all-patients-info'].dateRange.start}
                                onChange={(e) => handleParamChange('all-patients-info', 'dateRange', { ...reportParams['all-patients-info'].dateRange, start: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">To Date *</label>
                            <input
                                type="date"
                                value={reportParams['all-patients-info'].dateRange.end}
                                onChange={(e) => handleParamChange('all-patients-info', 'dateRange', { ...reportParams['all-patients-info'].dateRange, end: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => handleDownloadReport('all-patients-info')}
                        disabled={isReportLoading}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        <Download size={18} />
                        Download Report
                    </button>
                </div>

                {/* Single Patient Information Report */}
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="text-indigo-500" size={20} />
                        <h3 className="text-lg font-semibold text-gray-800">Single Patient Information Report</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Download detailed information for a specific patient.</p>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient *</label>
                        <select
                            value={reportParams['single-patient-info'].patientId}
                            onChange={(e) => handleParamChange('single-patient-info', 'patientId', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Select a Patient</option>
                            {allPatientsList.map(patient => (
                                <option key={patient.id} value={patient.id}>{patient.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => handleDownloadReport('single-patient-info')}
                        disabled={isReportLoading}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        <Download size={18} />
                        Download Report
                    </button>
                </div>

                {/* Bed Assignment Report */}
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center gap-2 mb-4">
                        <Bed className="text-green-500" size={20} />
                        <h3 className="text-lg font-semibold text-gray-800">Patient-Bed Assignment Report</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">View patient-bed assignments. Filter by patient, bed, or date range.</p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Patient (Optional)</label>
                            <select
                                value={reportParams['patient-bed-assignment'].patientId}
                                onChange={(e) => handleParamChange('patient-bed-assignment', 'patientId', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="">All Patients</option>
                                {allPatientsList.map(patient => (
                                    <option key={patient.id} value={patient.id}>{patient.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Bed (Optional)</label>
                            <input
                                type="text"
                                value={reportParams['patient-bed-assignment'].bedId}
                                onChange={(e) => handleParamChange('patient-bed-assignment', 'bedId', e.target.value)}
                                placeholder="e.g. Bed 5"
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From Date (Optional)</label>
                            <input
                                type="date"
                                value={reportParams['patient-bed-assignment'].dateRange.start}
                                onChange={(e) => handleParamChange('patient-bed-assignment', 'dateRange', { ...reportParams['patient-bed-assignment'].dateRange, start: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">To Date (Optional)</label>
                            <input
                                type="date"
                                value={reportParams['patient-bed-assignment'].dateRange.end}
                                onChange={(e) => handleParamChange('patient-bed-assignment', 'dateRange', { ...reportParams['patient-bed-assignment'].dateRange, end: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => handleDownloadReport('patient-bed-assignment')}
                        disabled={isReportLoading}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        <Download size={18} />
                        Download Report
                    </button>
                </div>

                {isReportLoading && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                        <p className="text-blue-700 font-medium">Generating report... Please wait.</p>
                    </div>
                )}
            </div>
        </Modal>
    );

    const ActivePatientsModal = () => (
        <Modal
            isOpen={showActivePatientsModal}
            onClose={() => setShowActivePatientsModal(false)}
            title={`Currently Admitted Patients (${activePatientsList.length})`}
        >
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ward</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bed Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {activePatientsList.map((patient) => (
                            <tr key={patient.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{patient.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.age} yrs</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.gender}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.ward}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.bed}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.admitted_at}</td>
                            </tr>
                        ))}
                        {activePatientsList.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">No patients currently admitted.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Modal>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Hospital Analytics Dashboard</h1>
                        <p className="text-gray-600 mt-2">Real-time monitoring and insights for better decision making</p>
                    </div>
                    <button
                        onClick={() => setShowReportsPanel(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg font-medium"
                    >
                        <FileText size={20} />
                        Generate Reports
                    </button>
                </div>

                {/* Key Metrics Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Key Metrics Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KPICard
                            title="Total Registered Patients"
                            value={patientKPIs.totalPatients}
                            icon={Users}
                            color="#3b82f6"
                            subtitle="All patients in system"
                        />
                        <KPICard
                            title="Currently Admitted"
                            value={patientKPIs.admittedPatients}
                            icon={User}
                            color="#8b5cf6"
                            onClick={handleActivePatientsClick}
                            subtitle="Click to view list"
                        />
                        <KPICard
                            title="Average Stay Duration"
                            value={patientKPIs.avgLengthOfStay}
                            icon={Calendar}
                            color="#10b981"
                            suffix=" days"
                            subtitle="Per patient admission"
                        />
                        <KPICard
                            title="Bed Utilization Rate"
                            value={bedKPIs.avgUtilization}
                            icon={TrendingUp}
                            color="#f59e0b"
                            suffix="%"
                            subtitle="Across all wards"
                        />
                    </div>
                </div>

                {/* Bed Management Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Bed Management Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KPICard
                            title="Total Bed Capacity"
                            value={bedKPIs.totalBeds}
                            icon={Bed}
                            color="#6b7280"
                            subtitle="Hospital-wide"
                        />
                        <KPICard
                            title="Current Occupancy"
                            value={bedKPIs.occupancyRate}
                            icon={Bed}
                            color="#ef4444"
                            suffix="%"
                            subtitle="Beds currently occupied"
                        />
                        <KPICard
                            title="Daily Turnover Rate"
                            value={bedKPIs.turnoverRate}
                            icon={TrendingUp}
                            color="#06b6d4"
                            suffix=" /day"
                            subtitle="Average bed changes"
                        />
                        <KPICard
                            title="Available Beds"
                            value={Math.round(bedKPIs.totalBeds * (1 - bedKPIs.occupancyRate / 100))}
                            icon={Bed}
                            color="#10b981"
                            subtitle="Ready for admission"
                        />
                    </div>
                </div>

                {/* Charts Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Detailed Analytics</h2>

                    {/* Admission Trends */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Weekly Admission & Discharge Trends</h3>
                            <p className="text-sm text-gray-600 mt-1">Track patient admissions and discharges over the past week</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={admissionDischargeTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" label={{ value: 'Number of Patients', angle: -90, position: 'insideLeft' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Line type="monotone" dataKey="admissions" stroke="#3b82f6" strokeWidth={3} name="New Admissions" dot={{ r: 5 }} />
                                <Line type="monotone" dataKey="discharges" stroke="#ef4444" strokeWidth={3} name="Discharges" dot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Distribution Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Gender Distribution */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Patient Gender Distribution</h3>
                                <p className="text-sm text-gray-600 mt-1">Current breakdown of patients by gender</p>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={patientDistribution.gender}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {patientDistribution.gender.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Floor Distribution */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Patient Distribution by Floor</h3>
                                <p className="text-sm text-gray-600 mt-1">Number of patients on each hospital floor</p>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={patientDistribution.floor}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {patientDistribution.floor.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bed Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Bed Occupancy */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Bed Occupancy by Floor</h3>
                                <p className="text-sm text-gray-600 mt-1">Occupied vs available beds on each floor</p>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={bedOccupancyByFloor}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="floor" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" label={{ value: 'Number of Beds', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="occupied" fill="#3b82f6" name="Occupied Beds" radius={[8, 8, 0, 0]} />
                                    <Bar dataKey="available" fill="#d1d5db" name="Available Beds" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Ward Utilization */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Ward Utilization Rates</h3>
                                <p className="text-sm text-gray-600 mt-1">Percentage of bed capacity being used per ward</p>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={bedUtilizationByWard}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="ward" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" unit="%" label={{ value: 'Utilization %', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="utilization" fill="#f59e0b" name="Utilization Rate" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Age Distribution */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Patient Age Group Distribution</h3>
                            <p className="text-sm text-gray-600 mt-1">Number of patients in each age category</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={patientDistribution.ageGroups}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#6b7280" label={{ value: 'Age Group', position: 'insideBottom', offset: -5 }} />
                                <YAxis stroke="#6b7280" label={{ value: 'Number of Patients', angle: -90, position: 'insideLeft' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                />
                                <Legend />
                                <Bar dataKey="value" fill="#a78bfa" name="Patient Count" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Modals */}
                {showActivePatientsModal && <ActivePatientsModal />}
                {showReportsPanel && <ReportsModal />}
            </div>
        </div>
    );
};

export default AnalyticsPage;