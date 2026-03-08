import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const rToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

            if (!rToken) {
                isRefreshing = false;
                // You can emit an event here to trigger a logout in AuthContext
                window.dispatchEvent(new Event('auth:logout'));
                return Promise.reject(error);
            }

            try {
                const response = await axios.post('/api/v1/auth/refresh', { refreshToken: rToken });
                const { token } = response.data;

                localStorage.setItem('token', token);
                api.defaults.headers.common['Authorization'] = 'Bearer ' + token;

                processQueue(null, token);

                originalRequest.headers['Authorization'] = 'Bearer ' + token;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Dispatch event so that AuthContext can listen and clear states
                window.dispatchEvent(new Event('auth:logout'));
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;

export const AuthService = {
    login: (data: any) => api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    updateStatus: (userId: number, status: string) => api.patch(`/auth/users/${userId}/status`, null, { params: { status } }),
    verifyPassword: (password: string) => api.post('/auth/verify-password', { password }),
    changePassword: (data: any) => api.post('/auth/change-password', data),
    sendEmailVerification: () => api.post('/auth/email/send-verification'),
    verifyEmail: (code: string) => api.post('/auth/email/verify', { code }),
    refreshToken: (refreshToken: string) => axios.post('/api/v1/auth/refresh', { refreshToken }),
};

export const CompanyService = {
    getCompanies: () => api.get('/companies'),
    registerCompany: (data: any) => api.post('/companies', data),
};

export const EmployeeService = {
    getAllEmployees: () => api.get('/employees'),
    getEmployeesByCompany: (companyCode: string) => api.get('/employees', { params: { companyCode } }),
    getEmployeesByFarm: (farmId: number) => api.get('/employees', { params: { farmId } }),
    // 기존 alias 유지
    getEmployees: (farmId: number) => api.get('/employees', { params: { farmId } }),
    getEmployee: (id: number) => api.get(`/employees/${id}`),
    createEmployee: (data: any) => api.post('/employees', data),
    updateEmployee: (id: number, data: any) => api.put(`/employees/${id}`, data),
    deleteEmployee: (id: number) => api.delete(`/employees/${id}`),
};

export const AttendanceService = {
    recordAttendance: (data: any) => api.post('/attendance', data),
    // Alias for compatibility
    clockIn: (data: any) => api.post('/attendance', { ...data, type: 'CLOCK_IN' }),
    clockOut: (data: any) => api.post('/attendance', { ...data, type: 'CLOCK_OUT' }),
    getUserStatus: () => api.get('/attendance/status'),
    getTodayRecord: (userId: number) => api.get(`/attendance/today/${userId}`),
    getMonthlySummary: (params: { year: number; month: number }) => api.get('/attendance/summary', { params }),
    getAttendanceLogs: (farmId: number, startDate: string, endDate: string) => api.get(`/attendance/farm/${farmId}`, { params: { startDate, endDate } }),
    getFarmAttendance: (farmId: number, startDate?: string, endDate?: string) => api.get(`/attendance/farm/${farmId}`, { params: { startDate, endDate } }),
    getCompanyAttendance: (companyCode: string, startDate?: string, endDate?: string) => api.get(`/attendance/company/${companyCode}`, { params: { startDate, endDate } }),
    getMyAttendance: () => api.get('/attendance/me'),
    exportAttendance: (params: any) => api.post('/attendance/export', params, { responseType: 'blob' }),
    updateStatus: (id: number, status: string, reason?: string) => api.patch(`/attendance/${id}/status`, { status, reason }),
    updateRecord: (id: number, data: { timestamp?: string; status?: string; reason?: string }) => api.put(`/attendance/${id}`, data),
    createAdminRecord: (data: { userId: number; type: string; timestamp: string; status: string; reason?: string }) => api.post('/attendance/admin/record', data),
    deleteRecord: (id: number) => api.delete(`/attendance/${id}`),
};

export const LeaveService = {
    getMyLeaves: () => api.get('/leaves/me'),
    saveLeave: (data: any) => api.post('/leaves', data),
    deleteLeave: (date: string) => api.delete(`/leaves/${date}`),
    // 기존 호환성 유지
    requestLeave: (data: any) => api.post('/leaves/request', data),
    getLeaveRecords: (userId: number) => api.get(`/leaves/user/${userId}`),
    getPendingLeaves: (farmId: number) => api.get(`/leaves/farm/${farmId}/pending`),
    getLeavesByFarm: (farmId: number, startDate: string, endDate: string) => api.get(`/leaves/farm/${farmId}`, { params: { startDate, endDate } }),
    getLeavesByCompany: (companyCode: string, startDate: string, endDate: string) => api.get(`/leaves/company/${companyCode}`, { params: { startDate, endDate } }),
    updateLeaveStatus: (id: number, status: string) => api.patch(`/leaves/${id}/status`, null, { params: { status } }),
};

export const DashboardService = {
    getTodayAttendance: (farmId: number) => api.get('/dashboard/attendance-today', { params: { farmId } }),
    getPendingApprovals: (farmId: number) => api.get('/dashboard/pending-approvals', { params: { farmId } }),
    updateApprovalStatus: (id: number, status: string, reason?: string) => api.patch('/dashboard/approval-status', null, { params: { id, status, reason } }),
};

export const FarmService = {
    getAllFarms: (params?: any) => api.get('/farms', { params }),
    getFarms: (companyCode: string) => api.get(`/farms/company/${companyCode}`),
    getFarm: (id: number) => api.get(`/farms/${id}`),
    createFarm: (data: any) => api.post('/farms', data),
    updateFarm: (id: number, data: any) => api.put(`/farms/${id}`, data),
    deleteFarm: (id: number) => api.delete(`/farms/${id}`),
};

export const ProductionService = {
    getSeasons: (farmId: number) => api.get(`/production/farms/${farmId}/seasons`),
    createSeason: (data: any) => api.post('/production/seasons', data),
    startSeason: (id: number) => api.post(`/production/seasons/${id}/start`),
    endSeason: (id: number) => api.post(`/production/seasons/${id}/end`),

    getHouses: (farmId: number) => api.get(`/production/farms/${farmId}/houses`),
    createHouse: (data: any) => api.post('/production/houses', data),

    getLines: (houseId: number) => api.get(`/production/houses/${houseId}/lines`),
    createLine: (data: any) => api.post('/production/lines', data),

    getBeds: (houseId: number) => api.get(`/production/houses/${houseId}/beds`),
    getBedsByLine: (lineId: number) => api.get(`/production/lines/${lineId}/beds`),
    createBed: (data: any) => api.post('/production/beds', data),

    getAllCrops: () => api.get('/production/crops'),
    createCrop: (data: any) => api.post('/production/crops', data),

    getPlantings: (seasonId: number) => api.get(`/production/seasons/${seasonId}/plantings`),
    getPlantingsByFarm: (farmId: number) => api.get(`/production/farms/${farmId}/plantings`),
    createPlanting: (data: any) => api.post('/production/plantings', data),
    deletePlanting: (id: number) => api.delete(`/production/plantings/${id}`),
    deleteCrop: (id: number) => api.delete(`/production/crops/${id}`),
};

export const HarvestService = {
    createHarvestRecord: (data: any) => api.post('/harvest/records', data),
    getHarvestRecords: (seasonId: number) => api.get(`/harvest/seasons/${seasonId}/records`)
};

export const SalesService = {
    registerCustomer: (data: any) => api.post('/sales/customers', data),
    getCustomers: (farmId: number) => api.get(`/sales/farms/${farmId}/customers`),
    createOrder: (data: any) => api.post('/sales/orders', data),
    getOrders: (customerId: number) => api.get(`/sales/customers/${customerId}/orders`)
};

export const CultivationService = {
    // Growth Records
    createGrowthRecord: (data: any) => api.post('/cultivation/growth-records', data),
    getGrowthRecordsByPlanting: (plantingId: number) => api.get(`/cultivation/growth-records/planting/${plantingId}`),
    getGrowthRecordsByCrop: (cropId: number) => api.get(`/cultivation/growth-records/crop/${cropId}`),
    getGrowthRecordsByDateRange: (startDate: string, endDate: string) => api.get('/cultivation/growth-records', { params: { startDate, endDate } }),

    // Pest Records
    createPestRecord: (data: any) => api.post('/cultivation/pest-records', data),
    getPestRecordsByBed: (bedId: number) => api.get(`/cultivation/pest-records/bed/${bedId}`),
    getPestRecordsByFarm: (farmId: number) => api.get(`/cultivation/pest-records/farm/${farmId}`),
    getPestRecordsByDateRange: (startDate: string, endDate: string) => api.get('/cultivation/pest-records', { params: { startDate, endDate } }),

    // Work Records
    createWorkRecord: (data: any) => api.post('/cultivation/work-records', data),
    getWorkRecordsByBed: (bedId: number) => api.get(`/cultivation/work-records/bed/${bedId}`),
    getWorkRecordsByDate: (workDate: string) => api.get(`/cultivation/work-records/date/${workDate}`),
    getWorkRecordsByFarm: (farmId: number) => api.get(`/cultivation/work-records/farm/${farmId}`),
    getWorkRecordsByFarmAndDate: (farmId: number, workDate: string) => api.get(`/cultivation/work-records/farm/${farmId}/date/${workDate}`),
    updateWorkRecordStatus: (id: number, status: string) => api.patch(`/cultivation/work-records/${id}/status`, null, { params: { status } }),
    deleteWorkRecord: (id: number) => api.delete(`/cultivation/work-records/${id}`),

    // Work Keywords
    getWorkKeywords: (farmId: number) => api.get(`/cultivation/work-keywords/farm/${farmId}`),
    createWorkKeyword: (farmId: number, data: any) => api.post(`/cultivation/work-keywords`, { ...data, farmId }),
    updateWorkKeyword: (farmId: number, id: number, data: any) => api.put(`/cultivation/work-keywords/${id}`, { ...data, farmId }),
    deleteWorkKeyword: (_farmId: number, id: number) => api.delete(`/cultivation/work-keywords/${id}`),

    // Work Stats
    getWorkStats: (farmId: number, startDate: string, endDate: string) => api.get(`/cultivation/work-stats/farm/${farmId}`, { params: { startDate, endDate } }),

    // Nutrient Records
    createNutrientRecord: (data: any) => api.post('/cultivation/nutrient-records', data),
    getNutrientRecordsByBed: (bedId: number) => api.get(`/cultivation/nutrient-records/bed/${bedId}`),
    getNutrientRecordsByFarm: (farmId: number) => api.get(`/cultivation/nutrient-records/farm/${farmId}`),
    getNutrientRecordsByDateRange: (startDate: string, endDate: string) => api.get('/cultivation/nutrient-records', { params: { startDate, endDate } }),
    updateNutrientRecord: (id: number, data: any) => api.put(`/cultivation/nutrient-records/${id}`, data),
    deleteNutrientRecord: (id: number) => api.delete(`/cultivation/nutrient-records/${id}`),
};
