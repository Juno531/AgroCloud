import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type {
    LoginRequest, RegisterRequest, AuthResponse,
    Company, CompanyCreateRequest, CompanyUpdateRequest,
    RegistrationCode, CodeGenerateRequest, ApiResponse
} from '../types';

// Use VITE_API_BASE_URL if set (for mobile access), otherwise use '/api/v1' (for PC with proxy)
const BASE_URL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
    : '/api/v1';

const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // 로그인 페이지에서는 401/403 에러 시 리다이렉트하지 않음
        if (error.response && error.response.status === 401) {
            // 현재 경로가 /login이 아닐 때만 리다이렉트
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const AuthService = {
    login: (credentials: LoginRequest) => api.post<AuthResponse>('/auth/login', credentials),
    register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
    me: () => api.get('/auth/me'),
    changePassword: async (data: any) => {
        return api.post('/auth/change-password', data);
    },
    verifyPassword: async (password: string) => {
        return api.post('/auth/verify-password', { password });
    },
    sendEmailVerification: () => api.post('/auth/email/send-verification'),
    verifyEmail: (code: string) => api.post('/auth/email/verify', { code }),
};

export const FarmService = {
    getAllFarms: (params?: any) => api.get('/farms', { params }),
    getFarm: (id: number) => api.get(`/farms/${id}`),
    createFarm: (data: any) => api.post('/farms', data),
    updateFarm: (id: number, data: any) => api.put(`/farms/${id}`, data),
    deleteFarm: (id: number) => api.delete(`/farms/${id}`)
};

export const ProductionService = {
    // Crops
    getAllCrops: () => api.get('/production/crops'),
    createCrop: (data: any) => api.post('/production/crops', data),

    // Seasons
    getSeasons: (farmId: number) => api.get(`/production/farms/${farmId}/seasons`),
    createSeason: (data: any) => api.post('/production/seasons', data),
    startSeason: (seasonId: number) => api.post(`/production/seasons/${seasonId}/start`),
    endSeason: (seasonId: number) => api.post(`/production/seasons/${seasonId}/end`),

    // Houses (Structures)
    getHouses: (farmId: number) => api.get(`/production/farms/${farmId}/houses`),
    createHouse: (data: any) => api.post('/production/houses', data),

    // Lines
    getLines: (houseId: number) => api.get(`/production/houses/${houseId}/lines`),
    createLine: (data: any) => api.post('/production/lines', data),
    getBedsByLine: (lineId: number) => api.get(`/production/lines/${lineId}/beds`),

    // Beds
    getBeds: (houseId: number) => api.get(`/production/houses/${houseId}/beds`),
    createBed: (data: any) => api.post('/production/beds', data),

    // Plantings
    getPlantings: (seasonId: number) => api.get(`/production/seasons/${seasonId}/plantings`),
    getPlantingsByFarm: (farmId: number) => api.get(`/production/farms/${farmId}/plantings`),
    createPlanting: (data: any) => api.post('/production/plantings', data),
    deletePlanting: (id: number) => api.delete(`/production/plantings/${id}`),

    // Crop deletion
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
    getGrowthRecordsByDateRange: (startDate: string, endDate: string) => api.get(`/cultivation/growth-records`, { params: { startDate, endDate } }),

    // Pest Records
    createPestRecord: (data: any) => api.post('/cultivation/pest-records', data),
    getPestRecordsByBed: (bedId: number) => api.get(`/cultivation/pest-records/bed/${bedId}`),
    getPestRecordsByFarm: (farmId: number) => api.get(`/cultivation/pest-records/farm/${farmId}`),
    getPestRecordsByDateRange: (startDate: string, endDate: string) => api.get(`/cultivation/pest-records`, { params: { startDate, endDate } }),

    // Work Records
    createWorkRecord: (data: any) => api.post('/cultivation/work-records', data),
    getWorkRecordsByBed: (bedId: number) => api.get(`/cultivation/work-records/bed/${bedId}`),
    getWorkRecordsByDate: (workDate: string) => api.get(`/cultivation/work-records/date/${workDate}`),
    getWorkRecordsByFarm: (farmId: number) => api.get(`/cultivation/work-records/farm/${farmId}`),

    // Harvest Predictions (Placeholder)
    createPrediction: (plantingId: number) => api.post(`/cultivation/plantings/${plantingId}/prediction`),
    getLatestPrediction: (plantingId: number) => api.get(`/cultivation/plantings/${plantingId}/prediction`),

    // Nutrient Records
    createNutrientRecord: (data: any) => api.post('/cultivation/nutrient-records', data),
    getNutrientRecordsByBed: (bedId: number) => api.get(`/cultivation/nutrient-records/bed/${bedId}`),
    getNutrientRecordsByFarm: (farmId: number) => api.get(`/cultivation/nutrient-records/farm/${farmId}`),
    getNutrientRecordsByDateRange: (startDate: string, endDate: string) => api.get(`/cultivation/nutrient-records`, { params: { startDate, endDate } }),
    updateNutrientRecord: (id: number, data: any) => api.put(`/cultivation/nutrient-records/${id}`, data),
    deleteNutrientRecord: (id: number) => api.delete(`/cultivation/nutrient-records/${id}`)
};

export const EmployeeService = {
    getAllEmployees: () => api.get('/employees'),
    getEmployeesByFarm: (farmId: number) => api.get(`/employees?farmId=${farmId}`),
    getEmployeesByCompany: (companyCode: string) => api.get(`/employees?companyCode=${companyCode}`),
    getEmployee: (id: number) => api.get(`/employees/${id}`),
    getEmployeeByUserId: (userId: number) => api.get(`/employees/user/${userId}`),
    registerEmployee: (data: any) => api.post('/employees', data),
    updateEmployee: (id: number, data: any) => api.put(`/employees/${id}`, data),
    deleteEmployee: (id: number) => api.delete(`/employees/${id}`)
};

export const AttendanceService = {
    recordAttendance: (data: { type: 'CLOCK_IN' | 'CLOCK_OUT'; farmId?: number; companyCode?: string; latitude?: number; longitude?: number }) =>
        api.post('/attendance', data),
    getMyAttendance: () => api.get('/attendance/me'),
    getFarmAttendance: (farmId: number, start?: string, end?: string) => api.get(`/attendance/farm/${farmId}`, { params: { startDate: start, endDate: end } }),
    getCompanyAttendance: (companyCode: string, start?: string, end?: string) => api.get(`/attendance/company/${companyCode}`, { params: { startDate: start, endDate: end } }),
    getUserStatus: () => api.get('/attendance/status'),
    getMonthlySummary: (year: number, month: number) => api.get('/attendance/summary', { params: { year, month } }),
    filterAttendance: (data: any) => api.post('/attendance/filter', data),
    exportAttendance: (data: any) => api.post('/attendance/export', data, { responseType: 'blob' }),
};


export const LeaveService = {
    saveLeave: (data: { leaveDate: string; reason?: string }) => api.post('/leaves', data),
    deleteLeave: (date: string) => api.delete(`/leaves/${date}`),
    getMyLeaves: () => api.get('/leaves/me'),
};

// Super Admin Services
export const CompanyService = {
    getAllCompanies: () => api.get<ApiResponse<Company[]>>('/super-admin/companies'),
    getCompany: (id: number) => api.get<ApiResponse<Company>>(`/super-admin/companies/${id}`),
    createCompany: (data: CompanyCreateRequest) => api.post<ApiResponse<Company>>('/super-admin/companies', data),
    updateCompany: (id: number, data: CompanyUpdateRequest) => api.put<ApiResponse<Company>>(`/super-admin/companies/${id}`, data),
    deleteCompany: (id: number) => api.delete(`/super-admin/companies/${id}`)
};

export const RegistrationCodeService = {
    generateCode: (data: CodeGenerateRequest) => api.post<ApiResponse<RegistrationCode>>('/super-admin/registration-codes', data),
    getCodes: (companyId?: number) => api.get<ApiResponse<RegistrationCode[]>>('/super-admin/registration-codes', { params: { companyId } }),
    deleteCode: (id: number) => api.delete(`/super-admin/registration-codes/${id}`),
    validateCode: (code: string) => api.post<ApiResponse<RegistrationCode>>('/super-admin/registration-codes/validate', { code })
};

export default api;
