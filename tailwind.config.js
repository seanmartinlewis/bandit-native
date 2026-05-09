/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        bitcount: ['BitcountPropSingle_700Bold'],
        redhat: ['RedHatDisplay_400Regular'],
        'redhat-medium': ['RedHatDisplay_500Medium'],
        'redhat-semibold': ['RedHatDisplay_600SemiBold'],
        'redhat-bold': ['RedHatDisplay_700Bold'],
      },
      colors: {
        bandit: {
          primary: '#2563eb',
          primaryStrong: '#1d4ed8',
          primaryDisabled: '#60a5fa',
          primaryDark: '#475569',
          primarySoft: '#64748b',
          primaryWash: '#eff6ff',
          primaryWashDark: 'rgba(71, 85, 105, 0.3)',
        },
        charcoal: {
          50: '#f6f6f5',
          100: '#e7e7e6',
          200: '#d1d0ce',
          300: '#b0afab',
          400: '#8a8985',
          500: '#6f6e6a',
          600: '#5f5e5a',
          700: '#4f4e4b',
          800: '#444340',
          900: '#1d1c19',
          950: '#131210',
        },
      },
    },
  },
  plugins: [],
};
