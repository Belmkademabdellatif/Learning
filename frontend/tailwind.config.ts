import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e1ff',
          300: '#b3c7ff',
          400: '#809aff',
          500: '#667eea',
          600: '#5568d3',
          700: '#4553b8',
          800: '#3a4694',
          900: '#333d7a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
