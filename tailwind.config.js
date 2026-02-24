/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                sans: ['Manrope', 'system-ui', 'sans-serif'],
                display: ['Manrope', 'system-ui', 'sans-serif'],
            },
            colors: {
                primary: '#10b981',
                brand: {
                    DEFAULT: '#10b981',
                    hover: '#059669',
                    light: '#34d399',
                    subtle: 'rgba(16, 185, 129, 0.15)',
                },
                neutral: {
                    bg1: 'hsl(240, 6%, 10%)',
                    bg2: 'hsl(240, 5%, 12%)',
                    bg3: 'hsl(240, 5%, 14%)',
                    bg4: 'hsl(240, 4%, 18%)',
                    bg5: 'hsl(240, 4%, 22%)',
                    bg6: 'hsl(240, 4%, 26%)',
                },
                text: {
                    primary: '#FFFFFF',
                    secondary: '#A1A1AA',
                    muted: '#71717A',
                },
                border: {
                    subtle: 'hsla(0, 0%, 100%, 0.08)',
                    DEFAULT: 'hsla(0, 0%, 100%, 0.12)',
                    strong: 'hsla(0, 0%, 100%, 0.20)',
                },
                status: {
                    success: '#10B981',
                    warning: '#F59E0B',
                    error: '#EF4444',
                    info: '#3B82F6',
                },
                dataviz: {
                    green: '#10B981',
                    blue: '#3B82F6',
                    yellow: '#F59E0B',
                    red: '#EF4444',
                    purple: '#8251EE',
                    pink: '#EC4899',
                    cyan: '#06B6D4',
                },
            },
            borderRadius: {
                DEFAULT: '0.5rem',
                lg: '0.75rem',
                xl: '1rem',
            },
            boxShadow: {
                glow: '0 0 20px rgba(16, 185, 129, 0.3)',
                'glow-lg': '0 0 40px rgba(16, 185, 129, 0.4)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            spacing: {
                'safe-top': 'env(safe-area-inset-top)',
                'safe-bottom': 'env(safe-area-inset-bottom)',
                'safe-left': 'env(safe-area-inset-left)',
                'safe-right': 'env(safe-area-inset-right)',
            },
            minHeight: {
                'touch': '44px',
            },
            minWidth: {
                'touch': '44px',
            },
        },
    },
    plugins: [],
}
