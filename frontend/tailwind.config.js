/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                //SyncStream brand palette - derived from the logo
                brand: {
                  purple: '#7C3AED', // Primary - matches logo purple
                  'purple-dark': '#4C1D95',
                  'purple-light': '#EDE9FE', 
                  pink: '#EC4899', //Accent - matches logo pink/coral
                  teal: '#0D9488',  // Secondary - matches logo - teal/blue
                  dark: '#1E1B2E', // Dark Background
                  darker: '#12101E', // Deeper dark for sidebar
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'float-up': 'floatUp 2s ease-out forwards',
                'fade-in': 'fadeIn 0.2s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
            },
            keyframes: {
                floatUp: {
                    '0%': { opacity: '1', transform: 'translateY(0) scale(1)'},
                    '100%': { opacity: '0', transform: 'translateY(-120px) scale(1.4)' }
                },
                fadeIn: { from: {opacity: '0'}, to: {opacity: '1'} },
                slideUp: { from: {transform: 'translateY(8px)', opacity: '0'},
                           to: {transform: 'translateY(0)', opacity: '1'}},
            }
        }
    },
    plugins: [],
}