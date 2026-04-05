import type { Config } from "tailwindcss";
import designSystem from "./src/styles/design-system";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: designSystem.colors,
      fontFamily: {
        sans: designSystem.typography.fontFamily.sans as unknown as string[],
        mono: designSystem.typography.fontFamily.mono as unknown as string[]
      },
      fontSize: {
        ...Object.entries(designSystem.typography.fontSize).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: Array.isArray(value) ? value.map(item => 
            typeof item === 'string' ? item : { ...item }
          ) : value
        }), {})
      },
      fontWeight: designSystem.typography.fontWeight,
      spacing: designSystem.spacing,
      borderRadius: designSystem.borderRadius,
      boxShadow: designSystem.boxShadow,
      screens: designSystem.breakpoints,
      zIndex: Object.entries(designSystem.zIndex).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value.toString()
      }), {}),
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        slideIn: 'slideIn 0.3s ease-out',
        scaleIn: 'scaleIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
