/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sherlock': {
          'dark': '#0f0f0f',
          'darker': '#1a1a1a',
          'gray': '#2a2a2a',
          'light-gray': '#3a3a3a',
          'medium-gray': '#6a6a6a',
          'text': '#e5e5e5',
          'text-secondary': '#a3a3a3',
          'border': '#404040',
          'accent': '#ffffff'
        }
      },
      fontFamily: {
        'serif': ['Georgia', 'Times New Roman', 'serif'],
        'mono': ['Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
