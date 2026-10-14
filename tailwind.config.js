
export default {
  content: ['./resources/views/**/*.blade.php', './resources/js/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f3f6fc',
          100: '#e4eaf6',
          200: '#c7d3ea',
          300: '#9bb0d6',
          400: '#6682b8',
          500: '#44609b',
          600: '#334b7e',
          700: '#2a3d66',
          800: '#1b2a4d',
          900: '#0f1c3a',
          950: '#080f24',
        },
        electric: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#bcd5ff',
          300: '#8ebaff',
          400: '#5994ff',
          500: '#2f6bff',
          600: '#1a4ff5',
          700: '#143bd9',
          800: '#1733ae',
          900: '#19327b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['Sora', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(8,15,36,0.05), 0 4px 16px -6px rgba(8,15,36,0.12)',
        lift: '0 2px 4px rgba(8,15,36,0.06), 0 16px 32px -12px rgba(8,15,36,0.22)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'toast-in': {
          '0%': { opacity: 0, transform: 'translateX(16px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .4s ease-out both',
        'toast-in': 'toast-in .25s ease-out both',
      },
    },
  },
  plugins: [],
};
