import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['"Source Code Pro"', 'monospace'],
      },
      colors: {
        background: '#020617', // Deep matte midnight
        foreground: '#F8FAFC',
        card: {
          DEFAULT: 'rgba(15, 23, 42, 0.7)', // Crystal matte
          foreground: '#F1F5F9',
        },
        popover: {
          DEFAULT: '#0F172A',
          foreground: '#F1F5F9',
        },
        primary: {
          DEFAULT: '#6779B9', // Periwinkle Blue
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#C47DA0', // Mauve
          foreground: '#F1F5F9',
        },
        muted: {
          DEFAULT: '#1E293B',
          foreground: '#94A3B8',
        },
        accent: {
          DEFAULT: '#FF900E', // Horizon Orange
          foreground: '#0F172A',
        },
        destructive: {
          DEFAULT: '#F43F5E',
          foreground: '#FFFFFF',
        },
        risk: {
          critical: '#F43F5E',
          medium: '#FF900E',
          low: '#FCDD2D',
          accent: '#D58FAA', // Soft Pink
        },
        border: 'rgba(255, 255, 255, 0.1)',
        input: 'rgba(255, 255, 255, 0.05)',
        ring: '#6779B9',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
