import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FarmService, ProductionService } from '../services/api';
import { useAuth } from './AuthContext';

interface Field {
    id: number;
    name: string;
    area: number;
    location?: string;
}

interface Crop {
    id: number;
    name: string;
    type: string;
}

interface FarmContextType {
    fields: Field[];
    crops: Crop[];
    addField: (field: { name: string; size: string; location?: string }) => Promise<void>;
    removeField: (id: number) => Promise<void>;
    addCrop: (crop: { name: string; type?: string }) => Promise<void>;
    removeCrop: (id: number) => Promise<void>;
    loading: boolean;
    error: string | null;
    refreshData: () => Promise<void>;
}

const FarmContext = createContext<FarmContextType | null>(null);

export const useFarm = (): FarmContextType => {
    const context = useContext(FarmContext);
    if (!context) {
        throw new Error('useFarm must be used within a FarmProvider');
    }
    return context;
};

interface FarmProviderProps {
    children: ReactNode;
}

export const FarmProvider: React.FC<FarmProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const [fields, setFields] = useState<Field[]>([]);
    const [crops, setCrops] = useState<Crop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!user) {
            setFields([]);
            setCrops([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const [farmsRes, cropsRes] = await Promise.all([
                FarmService.getAllFarms(),
                ProductionService.getAllCrops()
            ]);

            const farmsData = farmsRes.data.data.content || [];
            const cropsData = cropsRes.data.data || [];

            setFields(farmsData.map((f: any) => ({
                id: f.id,
                name: f.name,
                area: f.area,
                location: f.location
            })));

            setCrops(cropsData.map((c: any) => ({
                id: c.id,
                name: c.name,
                type: c.category || 'General'
            })));
        } catch (err) {
            console.error("Failed to fetch data from backend:", err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const addField = async (field: { name: string; size: string; location?: string }) => {
        try {
            const sizeNum = parseFloat(field.size) || 0;

            // Save to backend first and get the real ID
            const response = await FarmService.createFarm({
                name: field.name,
                area: sizeNum,
                location: field.location || "Unknown"
            });

            // Use the real ID from backend response
            const createdFarm = response.data.data;
            const newField: Field = {
                id: createdFarm.id,  // Use real ID from backend
                name: createdFarm.name,
                area: createdFarm.area,
                location: createdFarm.location
            };

            // Update UI with real data
            setFields(prev => [...prev, newField]);
        } catch (err) {
            console.error("Failed to create farm", err);
            throw err;
        }
    };

    const removeField = async (id: number) => {
        try {
            // Immediately update UI
            setFields(prev => prev.filter(f => f.id !== id));

            // Try to delete from backend
            try {
                await FarmService.deleteFarm(id);
            } catch (backendErr) {
                console.warn("Backend delete failed:", backendErr);
            }
        } catch (err) {
            console.error("Failed to delete farm", err);
            throw err;
        }
    };

    const addCrop = async (crop: { name: string; type?: string }) => {
        try {
            const newCrop: Crop = {
                id: Date.now(),
                name: crop.name,
                type: crop.type || "Generic"
            };

            // Immediately update UI
            setCrops(prev => [...prev, newCrop]);

            // Try to save to backend
            try {
                await ProductionService.createCrop({
                    name: crop.name,
                    type: crop.type || "Generic"
                });
                await fetchData();
            } catch (backendErr) {
                console.warn("Backend save failed, keeping local state:", backendErr);
            }
        } catch (err) {
            console.error("Failed to create crop", err);
            throw err;
        }
    };

    const removeCrop = async (id: number) => {
        try {
            // Immediately update UI
            setCrops(prev => prev.filter(c => c.id !== id));

            // Try to delete from backend
            try {
                await ProductionService.deleteCrop(id);
            } catch (backendErr) {
                console.warn("Backend delete failed, keeping local state:", backendErr);
            }
        } catch (err) {
            console.error("Failed to delete crop", err);
            throw err;
        }
    };

    return (
        <FarmContext.Provider value={{
            fields,
            crops,
            addField,
            removeField,
            addCrop,
            removeCrop,
            loading,
            error,
            refreshData: fetchData
        }}>
            {children}
        </FarmContext.Provider>
    );
};
