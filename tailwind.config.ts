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
        mono: designSystem.typography.fontFamily.mono as unknown as string[],
      },
      fontSize: {
        ...Object.entries(designSystem.typography.fontSize).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: Array.isArray(value)
              ? value.map((item) => (typeof item === "string" ? item : { ...item }))
              : value,
          }),
          {}
        ),
      },
      fontWeight: designSystem.typography.fontWeight,
      spacing: designSystem.spacing,
      borderRadius: designSystem.borderRadius,
      boxShadow: designSystem.boxShadow,
      screens: {
        xs: '480px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      zIndex: Object.entries(designSystem.zIndex).reduce(
        (acc, [key, value]) => ({ ...acc, [key]: value.toString() }),
        {}
      ),
      maxWidth: {
        '8xl': '1440px',
        '9xl': '1600px',
      },
      keyframes: {
        // Entrance
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%":   { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // Loading
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        // Glow
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(139, 92, 246, 0.25)" },
          "50%":      { boxShadow: "0 0 24px rgba(139, 92, 246, 0.45), 0 0 48px rgba(139, 92, 246, 0.2)" },
        },
        // Slider progress
        sliderProgress: {
          "0%":   { width: "0%" },
          "100%": { width: "100%" },
        },
      },
      animation: {
        fadeIn:        "fadeIn 0.3s ease-out",
        slideUp:       "slideUp 0.35s ease-out",
        slideIn:       "slideIn 0.3s ease-out",
        scaleIn:       "scaleIn 0.2s ease-out",
        shimmer:       "shimmer 1.8s ease-in-out infinite",
        pulseGlow:     "pulseGlow 2s ease-in-out infinite",
        sliderProgress10: "sliderProgress 10s linear forwards",
        sliderProgress20: "sliderProgress 20s linear forwards",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":  "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "card-shine": "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
