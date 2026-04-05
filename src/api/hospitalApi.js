import api from './api';

export const hospitalApiService = {
    getAllFloors: async () => {
        const response = await api.get('/hospital/');
        return response.data;
    },
    createFloor: async (floorData) => {
        const response = await api.post('/hospital/add-floor/', floorData);
        return response.data;
    },
    createWard: async (wardData) => {
        const response = await api.post('/hospital/add-ward/', wardData);
        return response.data;
    },
    createBed: async (bedData) => {
        const response = await api.post('/hospital/add-bed/', bedData);
        return response.data;
    },
    deleteFloor: async (floorId) => {
        const response = await api.delete(`/hospital/delete-floor/${floorId}/`);
        return response.data;
    },
    deleteWard: async (wardId) => {
        const response = await api.delete(`/hospital/delete-ward/${wardId}/`);
        return response.data;
    },
    deleteBed: async (bedId) => {
        const response = await api.delete(`/hospital/delete-bed/${bedId}/`);
        return response.data;
    },
    updateBedStatus: async (bedId, status) => {
        const response = await api.put(`/hospital/update-bed-status/${bedId}/`, {
            is_occupied: status
        });
        return response.data;
    }
};