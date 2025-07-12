/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        error: {
          DEFAULT: '#dc2626',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
        },
        success: {
          DEFAULT: '#16a34a',
        },
        warning: {
          DEFAULT: '#ca8a04',
        },
        // Background colors
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
        },
        // Foreground colors
        fg: {
          primary: 'var(--fg-primary)',
          secondary: 'var(--fg-secondary)',
          muted: 'var(--fg-muted)',
        },
        // Border colors
        border: {
          DEFAULT: 'var(--border)',
          light: 'var(--border-light)',
        },
      },
      spacing: {
        'compact-px': '1px',
        'compact-1': '2px',
        'compact-2': '4px',
        'compact-3': '8px',
      },
      fontSize: {
        'compact-xs': ['11px', '16px'],
        'compact-sm': ['13px', '18px'],
      },
    },
  },
  plugins: [],
} 
