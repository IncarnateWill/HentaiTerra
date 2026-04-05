/**
 * HentaiHaven-inspired Design System
 * Comprehensive design tokens and utilities for consistent UI
 * Based on HentaiHaven's distinctive pink and purple color palette
 */

// ===== COLOR PALETTE =====
export const colors = {
  // Primary Brand Colors (HentaiHaven Pink Family)
  primary: {
    50: '#ffe6f0',   // Lightest pink
    100: '#ffc2dc',  // Very light pink
    200: '#ff9dc7',  // Light pink
    300: '#ff78b3',  // Soft pink
    400: '#ff549e',  // Medium pink
    500: '#ff3366',  // Main HentaiHaven pink (from research)
    600: '#e32283',  // Hot pink (main brand color)
    700: '#c73075',  // Deep pink
    800: '#a32a62',  // Dark pink
    900: '#80244f',  // Very dark pink
    950: '#5d1e3c'   // Darkest pink
  },
  
  // Secondary Colors (Purple Family)
  secondary: {
    50: '#f3e5f5',   // Lightest purple
    100: '#e1bee7',  // Very light purple
    200: '#ce93d8',  // Light purple
    300: '#ba68c8',  // Soft purple
    400: '#ab47bc',  // Medium purple
    500: '#9c27b0',  // Main purple
    600: '#8e24aa',  // Rich purple
    700: '#7b1fa2',  // Deep purple
    800: '#6a1b9a',  // Dark purple
    900: '#4a148c',  // Very dark purple
    950: '#2e1065'   // Darkest purple
  },
  
  // Accent Colors (Supporting palette)
  accent: {
    teal: {
      400: '#76a5af',  // HentaiHaven teal accent (from research)
      500: '#5d8a94',
      600: '#4a737d',
      700: '#3a5c65'
    },
    coral: {
      400: '#fd8686',  // Light coral (from research)
      500: '#fc6c6c',
      600: '#f85a5a',
      700: '#e04a4a'
    },
    magenta: {
      400: '#ff4d94',
      500: '#ff3385',
      600: '#e62e77',
      700: '#cc2969'
    },
    violet: {
      400: '#b388ff',
      500: '#9575cd',
      600: '#7e57c2',
      700: '#673ab7'
    }
  },
  
  // Dark Theme Colors (HentaiHaven dark aesthetic)
  dark: {
    50: '#1a1a1a',    // Lightest dark
    100: '#1f1f1f',   // Very dark gray
    200: '#262626',   // Dark gray
    300: '#2d2d2d',   // Medium dark gray
    400: '#333333',   // Gray
    500: '#3a3a3a',   // Medium gray
    600: '#404040',   // Light gray
    700: '#4d4d4d',   // Lighter gray
    800: '#595959',   // Very light gray
    900: '#666666',   // Lightest gray
    950: '#737373'    // Near white
  },
  
  // Background Colors
  background: {
    main: '#0a0a0a',      // Deep black (main background)
    secondary: '#141414',  // Dark gray (secondary background)
    tertiary: '#1f1f1f',  // Medium dark (card backgrounds)
    elevated: '#262626',   // Lighter dark (elevated surfaces)
    overlay: 'rgba(0, 0, 0, 0.8)' // Semi-transparent overlay
  },
  
  // Text Colors
  text: {
    primary: '#ffffff',        // White text
    secondary: '#b3b3b3',      // Light gray text
    tertiary: '#808080',       // Medium gray text
    muted: '#595959',          // Dark gray text
    inverse: '#000000',        // Black text for light backgrounds
    accent: '#ff3366'          // Pink accent text
  },
  
  // Semantic Colors (adapted to HentaiHaven theme)
  semantic: {
    success: '#4ade80',   // Green for success
    warning: '#fbbf24',   // Yellow for warnings
    error: '#f87171',     // Red for errors
    info: '#60a5fa'       // Blue for info
  }
} as const;

// ===== TYPOGRAPHY =====
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace']
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }]
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  }
} as const;

// ===== SPACING =====
export const spacing = {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem'     // 256px
} as const;

// ===== BORDER RADIUS =====
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
} as const;

// ===== SHADOWS =====
export const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  
  // Colored shadows for interactive elements
  primary: '0 10px 15px -3px rgb(124 58 237 / 0.2), 0 4px 6px -4px rgb(124 58 237 / 0.1)',
  secondary: '0 10px 15px -3px rgb(236 72 153 / 0.2), 0 4px 6px -4px rgb(236 72 153 / 0.1)',
  accent: '0 10px 15px -3px rgb(59 130 246 / 0.2), 0 4px 6px -4px rgb(59 130 246 / 0.1)'
} as const;

// ===== COMPONENT VARIANTS =====
export const components = {
  // Button Variants (HentaiHaven-inspired)
  button: {
    base: 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    
    variants: {
      primary: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg focus:ring-primary-500',
      secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white shadow-lg focus:ring-secondary-500',
      accent: 'bg-gradient-to-r from-accent-teal-400 to-accent-teal-500 hover:from-accent-teal-500 hover:to-accent-teal-600 text-white shadow-lg focus:ring-accent-teal-400',
      outline: 'border-2 border-primary-500 text-primary-400 hover:bg-primary-500 hover:text-white focus:ring-primary-500',
      ghost: 'text-primary-400 hover:bg-dark-200 focus:ring-primary-500',
      danger: 'bg-gradient-to-r from-semantic-error to-red-600 hover:from-red-600 hover:to-red-700 text-white focus:ring-red-500',
      premium: 'bg-gradient-to-r from-accent-magenta-400 to-accent-violet-400 hover:from-accent-magenta-500 hover:to-accent-violet-500 text-white shadow-lg focus:ring-accent-magenta-400'
    },
    
    sizes: {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-base rounded-lg',
      lg: 'px-6 py-3 text-lg rounded-xl',
      xl: 'px-8 py-4 text-xl rounded-2xl'
    }
  },
  
  // Input Variants
  input: {
    base: 'w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed',
    
    variants: {
      default: 'bg-dark-200 border border-dark-400 text-text-primary placeholder:text-text-tertiary focus:ring-primary-500 focus:border-primary-500 hover:border-dark-500',
      filled: 'bg-dark-300 border border-dark-500 text-text-primary placeholder:text-text-tertiary focus:ring-primary-500 focus:border-primary-500 hover:border-dark-600',
      ghost: 'bg-transparent border-b-2 border-dark-500 text-text-primary placeholder:text-text-tertiary focus:ring-0 focus:border-primary-500 rounded-none',
      premium: 'bg-gradient-to-r from-dark-200 to-dark-300 border border-accent-magenta-400/30 text-text-primary placeholder:text-text-tertiary focus:ring-accent-magenta-400 focus:border-accent-magenta-400'
    },
    
    sizes: {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2.5 text-base rounded-lg',
      lg: 'px-5 py-3 text-lg rounded-xl'
    }
  },
  
  // Card Variants
  card: {
    base: 'transition-all duration-200',
    
    variants: {
      default: 'bg-background-tertiary border border-dark-400 shadow-lg',
      elevated: 'bg-background-tertiary border border-dark-400 shadow-xl hover:shadow-2xl',
      glass: 'bg-background-tertiary/80 backdrop-blur-sm border border-dark-400/50 shadow-lg',
      gradient: 'bg-gradient-to-br from-background-tertiary to-background-secondary border border-dark-400 shadow-xl',
      premium: 'bg-gradient-to-br from-dark-200 via-background-tertiary to-dark-300 border border-primary-500/30 shadow-xl'
    },
    
    sizes: {
      sm: 'p-4 rounded-lg',
      md: 'p-6 rounded-xl',
      lg: 'p-8 rounded-2xl'
    }
  },
  
  // Badge Variants
  badge: {
    base: 'inline-flex items-center font-medium',
    
    variants: {
      primary: 'bg-primary-600/20 text-primary-300 border border-primary-500/30',
      secondary: 'bg-secondary-600/20 text-secondary-300 border border-secondary-500/30',
      accent: 'bg-accent-teal-400/20 text-accent-teal-300 border border-accent-teal-400/30',
      success: 'bg-semantic-success/20 text-semantic-success border border-semantic-success/30',
      warning: 'bg-semantic-warning/20 text-semantic-warning border border-semantic-warning/30',
      danger: 'bg-semantic-error/20 text-semantic-error border border-semantic-error/30',
      neutral: 'bg-dark-600/50 text-text-secondary border border-dark-500/50',
      premium: 'bg-gradient-to-r from-accent-magenta-500/20 to-accent-violet-500/20 text-accent-magenta-300 border border-accent-magenta-400/30'
    },
    
    sizes: {
      sm: 'px-2 py-0.5 text-xs rounded-full',
      md: 'px-3 py-1 text-sm rounded-full',
      lg: 'px-4 py-1.5 text-base rounded-full'
    }
  }
} as const;

// ===== ANIMATIONS =====
export const animations = {
  // Entrance animations
  fadeIn: 'animate-[fadeIn_0.3s_ease-out]',
  slideIn: 'animate-[slideIn_0.3s_ease-out]',
  scaleIn: 'animate-[scaleIn_0.2s_ease-out]',
  
  // Interactive animations
  bounce: 'animate-[bounce_0.6s_ease-in-out]',
  pulse: 'animate-[pulse_2s_ease-in-out_infinite]',
  spin: 'animate-[spin_1s_linear_infinite]',
  
  // Hover effects
  hoverScale: 'hover:scale-105 transition-transform duration-200',
  hoverGlow: 'hover:shadow-lg hover:shadow-primary-500/20 transition-all duration-200',
  hoverPink: 'hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200',
  hoverPremium: 'hover:shadow-lg hover:shadow-accent-magenta-400/30 transition-all duration-200'
} as const;

// ===== UTILITY FUNCTIONS =====
export const utils = {
  // Combine classes utility
  cn: (...classes: (string | undefined | null | false)[]) => {
    return classes.filter(Boolean).join(' ');
  },
  
  // Get component classes
  getButtonClasses: (variant: keyof typeof components.button.variants = 'primary', size: keyof typeof components.button.sizes = 'md') => {
    return utils.cn(
      components.button.base,
      components.button.variants[variant],
      components.button.sizes[size]
    );
  },
  
  getInputClasses: (variant: keyof typeof components.input.variants = 'default', size: keyof typeof components.input.sizes = 'md') => {
    return utils.cn(
      components.input.base,
      components.input.variants[variant],
      components.input.sizes[size]
    );
  },
  
  getCardClasses: (variant: keyof typeof components.card.variants = 'default', size: keyof typeof components.card.sizes = 'md') => {
    return utils.cn(
      components.card.base,
      components.card.variants[variant],
      components.card.sizes[size]
    );
  },
  
  getBadgeClasses: (variant: keyof typeof components.badge.variants = 'primary', size: keyof typeof components.badge.sizes = 'md') => {
    return utils.cn(
      components.badge.base,
      components.badge.variants[variant],
      components.badge.sizes[size]
    );
  }
} as const;

// ===== BREAKPOINTS =====
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// ===== Z-INDEX SCALE =====
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800
} as const;

const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  components,
  animations,
  utils,
  breakpoints,
  zIndex
};

export default designSystem;