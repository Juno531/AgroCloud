export interface User {
    id: number;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    farmId: number;
    companyId?: number; // Added companyId
    companyCode?: string; // Added companyCode
    latitude?: number;
    longitude?: number;
    attendanceRadius?: number;
    lastPasswordChangedAt?: string;
    employmentType?: 'FULL_TIME' | 'PART_TIME';
}

export interface Company {
    id: number;
    name: string;
    code: string;
    businessNumber?: string;
    address?: string;
    phoneNumber?: string;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
}

export interface RegistrationCode {
    id: number;
    companyName: string;
    code: string;
    type: 'ADMIN' | 'EMPLOYEE';
    status: 'ACTIVE' | 'USED' | 'EXPIRED';
    expiresAt?: string;
    createdAt: string;
}

export interface Farm {
    id: number;
    name: string;
    address?: string;
    size?: number;
    userId: number;
    attendanceIpAddress?: string;
}

export interface Crop {
    id: number;
    name: string;
    variety?: string;
    plantingDate?: string;
}

export interface EmployeeProfile {
    id: number;
    userId: number;
    companyId?: number;
    companyCode?: string;
    farmId: number;
    name: string;
    phone: string;
    email: string;
    password?: string;
    hireDate: string;
    hourlyWage: number;
    bankAccount: string;
    accountHolder: string;
    paymentDate: number;
    role: 'USER' | 'ADMIN';
    employmentType?: 'FULL_TIME' | 'PART_TIME'; // 정규직/비정규직(알바)
}

export interface YieldData {
    id: number;
    farmId: number;
    cropName: string;
    date: string;
    quantity: number;
    unit: string;
    grade?: string;
    notes?: string;
}

export interface BedLayout {
    id: number;
    farmId: number;
    beds: Bed[];
}

export interface Bed {
    id: string;
    line: number;
    number: number;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
    crop?: string;
    plantingDate?: string;
}

// API Response Types
export interface AuthResponse {
    token: string;
    user: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    registrationCode: string;
    employmentType?: 'FULL_TIME' | 'PART_TIME';
}

// Company API Requests
export interface CompanyCreateRequest {
    // Company Details
    companyName: string;
    companyCode: string;
    businessNumber?: string;
    address?: string;
    phoneNumber?: string;

    // Admin User Details
    adminName: string;
    adminEmail: string;
    adminPassword: string;
    adminPhone?: string;
}

export interface CompanyUpdateRequest {
    name: string;
    address?: string;
    phoneNumber?: string;
    businessNumber?: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface CodeGenerateRequest {
    companyId: number;
    type: 'ADMIN' | 'EMPLOYEE';
    expiresAt?: string;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

// Context Types
export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (data: LoginRequest, rememberMe?: boolean) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    loading?: boolean;
}

export interface FarmContextType {
    currentFarm: Farm | null;
    farms: Farm[];
    setCurrentFarm: (farm: Farm | null) => void;
    addFarm: (farm: Omit<Farm, 'id'>) => Promise<void>;
    updateFarm: (id: number, farm: Partial<Farm>) => Promise<void>;
    deleteFarm: (id: number) => Promise<void>;
    refreshFarms: () => Promise<void>;
}

export interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

// Component Props Types
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

export interface YieldFormData {
    cropName: string;
    date: string;
    quantity: number;
    unit: string;
    grade?: string;
    notes?: string;
}

export interface YieldStatsData {
    totalYield: number;
    averageYield: number;
    yieldByDate: { date: string; quantity: number }[];
    yieldByCrop: { crop: string; quantity: number }[];
}

// Chart Data Types
export interface ChartDataPoint {
    date: string;
    [key: string]: string | number;
}

// Event Handler Types
export type ChangeEventHandler = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
export type FormEventHandler = React.FormEvent<HTMLFormElement>;
export type ClickEventHandler = React.MouseEvent<HTMLButtonElement>;
