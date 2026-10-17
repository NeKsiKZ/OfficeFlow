/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'rgb(var(--of-brand-50) / <alpha-value>)',
          100: 'rgb(var(--of-brand-100) / <alpha-value>)',
          200: 'rgb(var(--of-brand-200) / <alpha-value>)',
          500: 'rgb(var(--of-brand-500) / <alpha-value>)',
          600: 'rgb(var(--of-brand-600) / <alpha-value>)',
          700: 'rgb(var(--of-brand-700) / <alpha-value>)',
          800: 'rgb(var(--of-brand-800) / <alpha-value>)',
        },
        ink: {
          50: 'rgb(var(--of-ink-50) / <alpha-value>)',
          100: 'rgb(var(--of-ink-100) / <alpha-value>)',
          200: 'rgb(var(--of-ink-200) / <alpha-value>)',
          400: 'rgb(var(--of-ink-400) / <alpha-value>)',
          500: 'rgb(var(--of-ink-500) / <alpha-value>)',
          600: 'rgb(var(--of-ink-600) / <alpha-value>)',
          700: 'rgb(var(--of-ink-700) / <alpha-value>)',
          800: 'rgb(var(--of-ink-800) / <alpha-value>)',
          900: 'rgb(var(--of-ink-900) / <alpha-value>)',
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
        'ease-out-strong': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'ease-in-out-strong': 'cubic-bezier(0.77, 0, 0.175, 1)',
        drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      transitionDuration: {
        press: '120ms',
        ui: '200ms',
        sheet: '280ms',
      },
      boxShadow: {
        material: 'var(--of-shadow-material)',
        sheet: 'var(--of-shadow-sheet)',
      },
      borderRadius: {
        control: '12px',
        pill: '980px',
      },
    },
  },
  plugins: [],
}
