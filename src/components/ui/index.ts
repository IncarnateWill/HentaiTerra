// UI Components Export
export { Button, type ButtonProps } from './Button';
export { Input, type InputProps } from './Input';
export {
  Select,
  type SelectProps,
  type SelectOption,
} from './Select';
export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  type CardProps,
  type CardHeaderProps,
  type CardContentProps,
  type CardFooterProps,
} from './Card';

// Re-export design system utilities
export { cn } from '@/lib/utils';
export {
  components,
  utils,
  colors,
  typography,
  spacing
} from '@/styles/design-system';

// Spacing Utilities
export {
  layoutClasses,
  spacingClasses,
  componentSpacing,
  getSpacing,
  layoutPatterns
} from '@/styles/spacing';