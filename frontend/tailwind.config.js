/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6f3',
          100: '#d5ebe3',
          200: '#aed6c6',
          500: '#2f6f5e',
          600: '#245a4c',
          700: '#1c463b',
          800: '#15352e',
        },
        ink: {
          50: '#f7f7f8',
          100: '#eeeef0',
          200: '#dcdcde',
          400: '#8e8e93',
          500: '#636366',
          600: '#48484a',
          700: '#3a3a3c',
          900: '#1c1c1e',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.32, 0.72, 0, 1)',
        'spring-bounce': 'cubic-bezier(0.34, 1.2, 0.64, 1)',
      },
      transitionDuration: {
        press: '100ms',
        spring: '400ms',
        sheet: '380ms',
      },
      boxShadow: {
        material:
          '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        sheet: '0 0 0 0.5px rgba(0,0,0,0.06), 0 24px 80px rgba(0,0,0,0.18)',
      },
      borderRadius: {
        control: '12px',
        pill: '980px',
      },
    },
  },
  plugins: [],
}
