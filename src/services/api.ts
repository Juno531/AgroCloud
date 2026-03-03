import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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
};

export const LeaveService = {
    getMyLeaves: () => api.get('/leaves/me'),
    saveLeave: (data: any) => api.post('/leaves', data),
    deleteLeave: (date: string) => api.delete(`/leaves/${date}`),
    // 기존 호환성 유지
    requestLeave: (data: any) => api.post('/leaves/request', data),
    getLeaveRecords: (userId: number) => api.get(`/leaves/user/${userId}`),
    getPendingLeaves: (farmId: number) => api.get(`/leaves/farm/${farmId}/pending`),
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
    getWorkRecordsByFarm: (farmId: number) => api.get(`/cultivation/farms/${farmId}/work-records`),
    getWorkRecordsByFarmAndDate: (farmId: number, workDate: string) => api.get(`/cultivation/farms/${farmId}/work-records/date/${workDate}`),
    updateWorkRecordStatus: (id: number, status: string) => api.patch(`/cultivation/work-records/${id}/status`, null, { params: { status } }),
    deleteWorkRecord: (id: number) => api.delete(`/cultivation/work-records/${id}`),

    // Nutrient Records
    createNutrientRecord: (data: any) => api.post('/cultivation/nutrient-records', data),
    getNutrientRecordsByBed: (bedId: number) => api.get(`/cultivation/nutrient-records/bed/${bedId}`),
    getNutrientRecordsByFarm: (farmId: number) => api.get(`/cultivation/nutrient-records/farm/${farmId}`),
    getNutrientRecordsByDateRange: (startDate: string, endDate: string) => api.get('/cultivation/nutrient-records', { params: { startDate, endDate } }),
    updateNutrientRecord: (id: number, data: any) => api.put(`/cultivation/nutrient-records/${id}`, data),
    deleteNutrientRecord: (id: number) => api.delete(`/cultivation/nutrient-records/${id}`),
};
