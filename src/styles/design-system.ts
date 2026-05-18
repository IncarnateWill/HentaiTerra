/**
 * HentaiTerra Design System — Miruro-Inspired Dark Theme
 * Primary: Violet (#8b5cf6), Secondary: Pink (#e22283)
 * Background: Deep dark (#0a0b0f)
 */

// ===== COLOR PALETTE =====
export const colors = {
  // Primary Brand Colors — Violet family (Miruro-inspired)
  primary: {
    50:  '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',   // Main violet
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },

  // Secondary Colors — Pink brand identity
  secondary: {
    50:  '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#e22283',   // Main hot pink (brand color)
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    950: '#500724',
  },

  // Accent Colors
  accent: {
    teal: {
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
    },
    emerald: {
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
    },
    amber: {
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    rose: {
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48',
      700: '#be123c',
    },
  },

  // Dark shades — Deep blacks for backgrounds
  dark: {
    50:  '#1a1d27',   // Card elevated
    100: '#14161f',   // Card bg
    200: '#12141c',   // Tertiary bg
    300: '#0d0e14',   // Secondary bg
    400: '#0a0b0f',   // Main bg
    500: '#070809',   // Footer/darkest
    600: '#282c3e',   // Border light
    700: '#374151',   // Border medium
    800: '#4b5563',   // Muted border
    900: '#6b7280',   // Text muted
    950: '#9ca3af',   // Text secondary
  },

  // Background Colors — Miruro deep-dark palette
  background: {
    main:      '#0a0b0f',       // Deepest bg
    secondary: '#0d0e14',       // Slightly lighter
    tertiary:  '#12141c',       // Cards, panels
    elevated:  '#1a1d27',       // Elevated surfaces
    card:      '#14161f',       // Card default bg
    overlay:   'rgba(0, 0, 0, 0.85)',  // Modal/overlay
  },

  // Text Colors
  text: {
    primary:   '#f1f1f3',                    // Near-white
    secondary: '#9ca3af',                    // Gray-400
    tertiary:  '#6b7280',                    // Gray-500
    muted:     '#4b5563',                    // Gray-600
    inverse:   '#0a0b0f',                    // Dark (for light surfaces)
    accent:    '#a78bfa',                    // Violet accent text
  },

  // Semantic Colors
  semantic: {
    success: '#10b981',   // Emerald
    warning: '#f59e0b',   // Amber
    error:   '#ef4444',   // Red
    info:    '#3b82f6',   // Blue
  },
} as const;

// ===== TYPOGRAPHY =====
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
  },

  fontSize: {
    xs:   ['0.7rem',   { lineHeight: '1rem' }],
    sm:   ['0.8125rem', { lineHeight: '1.25rem' }],
    base: ['1rem',     { lineHeight: '1.5rem' }],
    lg:   ['1.125rem', { lineHeight: '1.75rem' }],
    xl:   ['1.25rem',  { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem',  { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem',    { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
  },

  fontWeight: {
    normal:    '400',
    medium:    '500',
    semibold:  '600',
    bold:      '700',
    extrabold: '800',
    black:     '900',
  },
} as const;

// ===== SPACING =====
export const spacing = {
  0:  '0px',
  1:  '0.25rem',
  2:  '0.5rem',
  3:  '0.75rem',
  4:  '1rem',
  5:  '1.25rem',
  6:  '1.5rem',
  8:  '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
  48: '12rem',
  56: '14rem',
  64: '16rem',
} as const;

// ===== BORDER RADIUS =====
export const borderRadius = {
  none:  '0px',
  sm:    '0.25rem',
  base:  '0.375rem',
  md:    '0.5rem',
  lg:    '0.75rem',
  xl:    '1rem',
  '2xl': '1.25rem',
  '3xl': '1.5rem',
  full:  '9999px',
} as const;

// ===== SHADOWS =====
export const boxShadow = {
  sm:    '0 1px 2px 0 rgb(0 0 0 / 0.2)',
  base:  '0 1px 3px 0 rgb(0 0 0 / 0.3)',
  md:    '0 4px 8px -1px rgb(0 0 0 / 0.35)',
  lg:    '0 10px 20px -3px rgb(0 0 0 / 0.4)',
  xl:    '0 20px 30px -5px rgb(0 0 0 / 0.45)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.5)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.2)',

  // Glow shadows
  primary:   '0 0 20px rgba(139, 92, 246, 0.25), 0 4px 16px rgb(0 0 0 / 0.4)',
  secondary: '0 0 20px rgba(226, 34, 131, 0.25), 0 4px 16px rgb(0 0 0 / 0.4)',
  card:      '0 4px 24px rgba(0, 0, 0, 0.5)',
} as const;

// ===== COMPONENT VARIANTS =====
export const components = {
  button: {
    base: 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed',

    variants: {
      primary:   'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary-500/20 focus:ring-primary-500',
      secondary: 'bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white shadow-lg shadow-secondary-600/20 focus:ring-secondary-500',
      accent:    'bg-gradient-to-r from-accent-teal-500 to-accent-teal-600 hover:from-accent-teal-600 hover:to-accent-teal-700 text-white shadow-lg focus:ring-accent-teal-400',
      outline:   'border border-primary-500/50 text-primary-400 hover:bg-primary-500/10 hover:border-primary-500 focus:ring-primary-500',
      ghost:     'text-text-secondary hover:text-text-primary hover:bg-white/5 focus:ring-primary-500',
      danger:    'bg-gradient-to-r from-semantic-error to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg focus:ring-red-500',
    },

    sizes: {
      sm:  'px-3 py-1.5 text-xs rounded-full',
      md:  'px-4 py-2 text-sm rounded-full',
      lg:  'px-5 py-2.5 text-base rounded-full',
      xl:  'px-8 py-3.5 text-lg rounded-full',
    },
  },

  input: {
    base: 'w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed',

    variants: {
      default: 'bg-dark-100 border border-dark-600/30 text-text-primary placeholder:text-text-muted focus:ring-primary-500/40 focus:border-primary-500/50 hover:border-dark-700/50',
      filled:  'bg-dark-300/80 border border-dark-600/20 text-text-primary placeholder:text-text-muted focus:ring-primary-500/40 focus:border-primary-500/50',
      ghost:   'bg-transparent border-b border-dark-600/30 text-text-primary placeholder:text-text-muted focus:ring-0 focus:border-primary-500/50 rounded-none',
    },

    sizes: {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-4 py-2.5 text-base rounded-xl',
      lg: 'px-5 py-3 text-lg rounded-xl',
    },
  },

  card: {
    base: 'transition-all duration-200',

    variants: {
      default:  'bg-background-card border border-dark-600/20 shadow-card',
      elevated: 'bg-background-elevated border border-dark-600/20 shadow-xl',
      glass:    'bg-background-tertiary/80 backdrop-blur-sm border border-dark-600/15 shadow-lg',
      gradient: 'bg-gradient-to-br from-background-tertiary to-background-secondary border border-dark-600/20 shadow-xl',
      minimal:  'bg-background-card border-0 shadow-none',
    },

    sizes: {
      sm: 'p-4 rounded-xl',
      md: 'p-6 rounded-2xl',
      lg: 'p-8 rounded-2xl',
    },
  },

  badge: {
    base: 'inline-flex items-center font-bold tracking-wide uppercase',

    variants: {
      primary:   'bg-primary-500/15 text-primary-400 border border-primary-500/25',
      secondary: 'bg-secondary-600/15 text-secondary-300 border border-secondary-600/25',
      success:   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
      warning:   'bg-amber-500/15 text-amber-400 border border-amber-500/25',
      danger:    'bg-red-500/15 text-red-400 border border-red-500/25',
      neutral:   'bg-dark-100/60 text-text-secondary border border-dark-600/20',
      censored:  'bg-red-500/20 text-red-400 border border-red-500/30',
      uncensored:'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },

    sizes: {
      xs: 'px-1.5 py-0.5 text-[0.6rem] rounded-full',
      sm: 'px-2 py-0.5 text-[0.65rem] rounded-full',
      md: 'px-2.5 py-1 text-xs rounded-full',
    },
  },
} as const;

// ===== ANIMATIONS =====
export const animations = {
  fadeIn:   'animate-[fadeIn_0.3s_ease-out]',
  slideUp:  'animate-[slideUp_0.35s_ease-out]',
  slideIn:  'animate-[slideIn_0.3s_ease-out]',
  scaleIn:  'animate-[scaleIn_0.2s_ease-out]',
  shimmer:  'shimmer',

  hoverScale:  'hover:scale-105 transition-transform duration-200',
  hoverLift:   'hover:-translate-y-1 transition-transform duration-200',
  hoverGlow:   'hover:shadow-lg hover:shadow-primary-500/20 transition-all duration-300',
  cardGlow:    'card-glow',
} as const;

// ===== UTILITY FUNCTIONS =====
export const utils = {
  cn: (...classes: (string | undefined | null | false)[]) =>
    classes.filter(Boolean).join(' '),

  getButtonClasses: (variant: keyof typeof components.button.variants = 'primary', size: keyof typeof components.button.sizes = 'md') =>
    utils.cn(components.button.base, components.button.variants[variant], components.button.sizes[size]),

  getInputClasses: (variant: keyof typeof components.input.variants = 'default', size: keyof typeof components.input.sizes = 'md') =>
    utils.cn(components.input.base, components.input.variants[variant], components.input.sizes[size]),

  getCardClasses: (variant: keyof typeof components.card.variants = 'default', size: keyof typeof components.card.sizes = 'md') =>
    utils.cn(components.card.base, components.card.variants[variant], components.card.sizes[size]),

  getBadgeClasses: (variant: keyof typeof components.badge.variants = 'primary', size: keyof typeof components.badge.sizes = 'sm') =>
    utils.cn(components.badge.base, components.badge.variants[variant], components.badge.sizes[size]),
} as const;

// ===== BREAKPOINTS =====
export const breakpoints = {
  xs:    '480px',
  sm:    '640px',
  md:    '768px',
  lg:    '1024px',
  xl:    '1280px',
  '2xl': '1536px',
} as const;

// ===== Z-INDEX =====
export const zIndex = {
  hide:      -1,
  auto:      'auto',
  base:      0,
  docked:    10,
  dropdown:  1000,
  sticky:    1100,
  banner:    1200,
  overlay:   1300,
  modal:     1400,
  popover:   1500,
  toast:     1700,
  tooltip:   1800,
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
  zIndex,
};

export default designSystem;