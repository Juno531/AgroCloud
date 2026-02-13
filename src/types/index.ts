// Domain Types
export interface User {
    id: number;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
}

export interface Farm {
    id: number;
    name: string;
    address?: string;
    size?: number;
    userId: number;
}

export interface Crop {
    id: number;
    name: string;
    variety?: string;
    plantingDate?: string;
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
    type: string;
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
    inviteCode: string;
    farmInviteCode?: string;  // 작업자 가입 시 농장 코드
    registerType: 'admin' | 'worker';
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
    login: (email: string, password: string) => Promise<void>;
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
