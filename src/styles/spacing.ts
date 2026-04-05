/**
 * Spacing utilities for consistent layout patterns
 * Based on the design system spacing tokens
 */

import { spacing } from './design-system';
import { cn } from '@/lib/utils';

// Layout container classes
export const layoutClasses = {
  // Page containers
  pageContainer: cn(
    'min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900',
    'text-white relative overflow-hidden'
  ),
  
  // Content containers
  contentContainer: cn(
    'container mx-auto px-4 sm:px-6 lg:px-8',
    'max-w-7xl'
  ),
  
  // Section containers
  sectionContainer: cn(
    'py-8 md:py-12 lg:py-16'
  ),
  
  // Card containers
  cardContainer: cn(
    'p-4 md:p-6 lg:p-8'
  ),
  
  // Form containers
  formContainer: cn(
    'space-y-4 md:space-y-6'
  ),
  
  // Grid containers
  gridContainer: cn(
    'grid gap-4 md:gap-6 lg:gap-8'
  ),
  
  // Flex containers
  flexContainer: cn(
    'flex gap-2 md:gap-4'
  )
};

// Responsive spacing utilities
export const spacingClasses = {
  // Margins
  margin: {
    xs: 'margin-1',
    sm: 'margin-2',
    md: 'margin-4',
    lg: 'margin-6',
    xl: 'margin-8',
    '2xl': 'margin-12',
    '3xl': 'margin-16'
  },
  
  // Padding
  padding: {
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    '2xl': 'p-12',
    '3xl': 'p-16'
  },
  
  // Gaps
  gap: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-12',
    '3xl': 'gap-16'
  },
  
  // Responsive padding
  responsivePadding: {
    xs: 'p-2 md:p-4',
    sm: 'p-3 md:p-6',
    md: 'p-4 md:p-8',
    lg: 'p-6 md:p-12',
    xl: 'p-8 md:p-16'
  },
  
  // Responsive margins
  responsiveMargin: {
    xs: 'm-2 md:m-4',
    sm: 'm-3 md:m-6',
    md: 'm-4 md:m-8',
    lg: 'm-6 md:m-12',
    xl: 'm-8 md:m-16'
  }
};

// Component-specific spacing patterns
export const componentSpacing = {
  // Navigation spacing
  navbar: {
    padding: 'px-4 py-2 md:px-6 md:py-3',
    itemGap: 'gap-1 md:gap-2',
    logoGap: 'gap-2'
  },
  
  // Card spacing
  card: {
    padding: 'p-4 md:p-6',
    headerPadding: 'p-4 md:p-6 pb-2 md:pb-3',
    contentPadding: 'px-4 md:px-6 pb-4 md:pb-6',
    footerPadding: 'px-4 md:px-6 py-3 md:py-4',
    gap: 'space-y-3 md:space-y-4'
  },
  
  // Form spacing
  form: {
    fieldGap: 'space-y-4 md:space-y-6',
    labelGap: 'space-y-1 md:space-y-2',
    buttonGap: 'space-y-4 md:space-y-6',
    sectionGap: 'space-y-6 md:space-y-8'
  },
  
  // Button spacing
  button: {
    padding: {
      sm: 'px-3 py-1.5',
      md: 'px-4 py-2',
      lg: 'px-6 py-3',
      xl: 'px-8 py-4'
    },
    gap: 'gap-2'
  },
  
  // List spacing
  list: {
    itemGap: 'space-y-2 md:space-y-3',
    itemPadding: 'p-3 md:p-4',
    nestedGap: 'space-y-1 md:space-y-2'
  },
  
  // Grid spacing
  grid: {
    gap: 'gap-4 md:gap-6 lg:gap-8',
    columns: {
      responsive: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      cards: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      wide: 'grid-cols-1 lg:grid-cols-2'
    }
  },
  
  // Section spacing
  section: {
    padding: 'py-8 md:py-12 lg:py-16',
    margin: 'mb-8 md:mb-12 lg:mb-16',
    headerGap: 'space-y-2 md:space-y-4',
    contentGap: 'space-y-6 md:space-y-8'
  }
};

// Utility functions for dynamic spacing
export const getSpacing = {
  /**
   * Get responsive padding class
   */
  padding: (size: keyof typeof spacingClasses.responsivePadding) => 
    spacingClasses.responsivePadding[size],
  
  /**
   * Get responsive margin class
   */
  margin: (size: keyof typeof spacingClasses.responsiveMargin) => 
    spacingClasses.responsiveMargin[size],
  
  /**
   * Get gap class
   */
  gap: (size: keyof typeof spacingClasses.gap) => 
    spacingClasses.gap[size],
  
  /**
   * Get component-specific spacing
   */
  component: <T extends keyof typeof componentSpacing>(
    component: T
  ): typeof componentSpacing[T] => componentSpacing[component]
};

// Layout patterns for common use cases
export const layoutPatterns = {
  // Hero section
  hero: cn(
    layoutClasses.pageContainer,
    'flex items-center justify-center',
    componentSpacing.section.padding
  ),
  
  // Content section
  contentSection: cn(
    layoutClasses.contentContainer,
    componentSpacing.section.padding,
    componentSpacing.section.contentGap
  ),
  
  // Card grid
  cardGrid: cn(
    layoutClasses.gridContainer,
    componentSpacing.grid.gap,
    componentSpacing.grid.columns.cards
  ),
  
  // Form layout
  formLayout: cn(
    'max-w-md mx-auto',
    componentSpacing.form.fieldGap,
    componentSpacing.card.padding
  ),
  
  // Dashboard layout
  dashboardLayout: cn(
    layoutClasses.contentContainer,
    'grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8',
    componentSpacing.section.padding
  ),
  
  // Sidebar layout
  sidebarLayout: cn(
    'grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8'
  )
};

const spacingSystem = {
  layoutClasses,
  spacingClasses,
  componentSpacing,
  getSpacing,
  layoutPatterns
};

export default spacingSystem;