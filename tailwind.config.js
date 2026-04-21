/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#1a1a1f',
        foreground: '#f2f2f2',
        card: 'rgba(26, 26, 31, 0.7)',
        cardforeground: '#f2f2f2',
        popover: '#26262e',
        popoverforeground: '#f2f2f2',
        primary: '#eab308',
        primaryforeground: '#1a1a1f',
        secondary: '#ea580c',
        secondaryforeground: '#f2f2f2',
        muted: '#3f3f46',
        mutedforeground: '#a1a1aa',
        accent: '#8b5cf6',
        accentforeground: '#f2f2f2',
        destructive: '#dc2626',
        destructiveforeground: '#f2f2f2',
        border: 'rgba(255, 255, 255, 0.1)',
        input: 'rgba(255, 255, 255, 0.05)',
        ring: 'rgba(234, 179, 8, 0.4)',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.4rem',
        sm: '0.3rem',
      },
    },
  },
  plugins: [],
}