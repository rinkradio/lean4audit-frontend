/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0a1524',
          900: '#0b1a2b',
          800: '#10233a',
          700: '#16324f',
          600: '#1c2530',
        },
        surface: '#ffffff',
        canvas: '#f5f7fa',
        line: {
          DEFAULT: '#e2e5ea',
          strong: '#c7cdd6',
        },
        ink2: {
          DEFAULT: '#14181f',
          secondary: '#56606e',
          muted: '#8a94a3',
          inverse: '#f4f6f8',
        },
        brand: {
          DEFAULT: '#1c5cff',
          hover: '#164ad1',
          soft: '#eaf0ff',
          50: '#eef3ff',
          100: '#dbe6ff',
        },
        danger: {
          DEFAULT: '#d0342c',
          soft: '#fbeceb',
          hover: '#b32a24',
        },
        success: {
          DEFAULT: '#1a7f4f',
          soft: '#e9f7f0',
        },
        warning: {
          DEFAULT: '#b45309',
          soft: '#fef3e0',
        },
      },
      boxShadow: {
        xs: '0 1px 2px rgba(11, 26, 43, 0.06)',
        card: '0 8px 24px rgba(11, 26, 43, 0.08)',
        pop: '0 24px 64px rgba(11, 26, 43, 0.16)',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '20px',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'scale-in': {
          from: { opacity: 0, transform: 'scale(0.96) translateY(4px)' },
          to: { opacity: 1, transform: 'scale(1) translateY(0)' },
        },
        'slide-up': {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: 0, transform: 'translateX(24px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        'toast-in': {
          from: { opacity: 0, transform: 'translateY(-8px) scale(0.98)' },
          to: { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 180ms ease-out',
        'scale-in': 'scale-in 180ms cubic-bezier(0.16,1,0.3,1)',
        'slide-up': 'slide-up 220ms cubic-bezier(0.16,1,0.3,1)',
        'slide-in-right': 'slide-in-right 260ms cubic-bezier(0.16,1,0.3,1)',
        'toast-in': 'toast-in 200ms cubic-bezier(0.16,1,0.3,1)',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
