module.exports = {
    content: [
        './index.html',
        './src/**/*.{ts,tsx,js,jsx}'
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366f1',
                    dark: '#4f46e5'
                },
                accent: '#f97316',
                surface: '#0f172a'
            }
        }
    },
    plugins: []
}
