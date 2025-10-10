import api from './api';

export const patientApiService = {
    getAllPatients: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const response = await api.get(`/hospital/patients/?${params}`);
        return response.data;
    },

    getPatientDetail: async (patientId) => {
        const response = await api.get(`/hospital/patients/${patientId}/`);
        return response.data;
    },

    createPatient: async (patientData) => {
        const response = await api.post('/hospital/patients/create/', patientData);
        return response.data;
    },

    dischargePatient: async (patientId, dischargeData) => {
        const response = await api.put(`/hospital/patients/${patientId}/discharge/`, dischargeData);
        return response.data;
    },

    deletePatient: async (patientId) => {
        const response = await api.delete(`/hospital/patients/${patientId}/delete/`);
        return response.data;
    },

    getPatientBedHistory: async (patientId) => {
        const response = await api.get(`/hospital/patients/${patientId}/bed-history/`);
        return response.data;
    },

    getDeviceBedHistory: async (patientId) => {
        const response = await api.get(`/hospital/patients/${patientId}/device-history/`);
        return response.data;
    },

    getAllPatientsWithHistory: async () => {
        const response = await api.get('/hospital/patients/with-history/');
        return response.data;
    }
};