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
                    DEFAULT: '#EC602B', // Orange braise officiel
                    dark: '#C44B1D',
                    light: '#FF7E2E',
                },
                secondary: {
                    DEFAULT: '#6F2B75', // Violet Phœnix officiel
                    light: '#904990',
                },
                phoenix: {
                    purple: '#6F2B75',
                    'purple-light': '#904990',
                    dark: '#2A082D',
                    orange: '#EC602B',
                    'orange-light': '#FF7E2E',
                    cream: '#FFFBF4',
                    lilac: '#ECDDFD',
                    'lilac-soft': '#D9BEF8',
                    rose: '#E1BBCB',
                },
                canvas: '#FFFBF4', // Crème chaud officiel
                paper: '#FFFFFF',
                sand: '#ECDDFD',   // Lilas doux
                ink: {
                    DEFAULT: '#2A082D', // Violet sombre profond au lieu du noir pur
                    light: '#542359',
                    muted: '#7C677E',
                },
                current: {
                    bg: '#2A082D',
                    card: '#3D1041',
                }
            },
            fontFamily: {
                sans: ['"Montserrat"', 'system-ui', '-apple-system', 'sans-serif'],
                display: ['"Shrikhand"', 'cursive'],
                script: ['"Allura"', 'cursive'],
                school: ['"Outfit"', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 10px 30px -10px rgba(111, 43, 117, 0.12)',
                'soft-lg': '0 20px 40px -15px rgba(111, 43, 117, 0.18)',
                'glow-orange': '0 10px 30px -5px rgba(236, 96, 43, 0.35)',
                'glow-purple': '0 10px 30px -5px rgba(111, 43, 117, 0.35)',
            },
        },
    },
    plugins: [],
}
