/**
 * API Configuration
 * 
 * This module provides the base URL for API requests.
 * 
 * - On PC (localhost): Uses empty string to leverage Vite proxy
 * - On Mobile: Set VITE_API_BASE_URL to PC's IP address (e.g., http://192.168.0.19:8080)
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Helper function to construct full API URLs
 * @param path - API path (e.g., '/api/v1/auth/login')
 * @returns Full URL with base URL prepended if needed
 */
export const getApiUrl = (path: string): string => {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // If API_BASE_URL is set, prepend it; otherwise, return path as-is (proxy will handle it)
    return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
};
