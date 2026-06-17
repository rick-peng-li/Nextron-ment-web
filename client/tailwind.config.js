/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0A0A0A',
                accent: '#00FFD1',
                'accent-2': '#FF3366',
            }
        },
    },
    plugins: [],
}
