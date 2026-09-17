/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            screens: {
                'xs': '480px',
            },
            colors: {
                primary: {
                    DEFAULT: '#FF6B00', // Phoenix Orange
                    dark: '#CC5500',
                    light: '#FF8533',
                },
                secondary: {
                    DEFAULT: '#6D28D9', // Phoenix Violet
                    light: '#8B5CF6',
                },
                canvas: '#FBF9F5', // Warm paper/ecru canvas
                paper: '#F7F4EE',  // Card tone
                sand: '#EFECE6',   // Deep card / neutral sand
                ink: {
                    DEFAULT: '#0A1120', // Deep editorial ink
                    light: '#1E293B',
                    muted: '#475569',
                },
                terracotta: {
                    DEFAULT: '#EA580C',
                    soft: '#FED7AA',
                    light: '#FFF7ED',
                },
                current: {
                    bg: '#0f0518',
                    card: '#1a1025',
                }
            },
            fontFamily: {
                sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
                display: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
            },
            boxShadow: {
                'brut-sm': '2px 2px 0px 0px #0A1120',
                'brut': '3px 3px 0px 0px #0A1120',
                'brut-lg': '5px 5px 0px 0px #0A1120',
                'brut-orange': '3px 3px 0px 0px #EA580C',
                'brut-orange-lg': '5px 5px 0px 0px #EA580C',
                'brut-white': '3px 3px 0px 0px #FFFFFF',
            },
        },
    },
    plugins: [],
}
