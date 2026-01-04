/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#121212',
                stone: {
                    light: '#3d3d3d',
                    DEFAULT: '#2d2d2d',
                    dark: '#1f1f1f',
                },
                gold: {
                    DEFAULT: '#D4AF37',
                    glow: '#F4CF57',
                },
                magma: '#d47e37',
                rose: {
                    DEFAULT: '#ffc0cb',
                }
            },
            fontFamily: {
                mono: ['"Courier Prime"', 'monospace'],
                serif: ['"Playfair Display"', 'serif'],
            },
            backgroundImage: {
                'noise': "url('/noise.png')", // We might need to generate or find a noise texture
            }
        },
    },
    plugins: [],
}
