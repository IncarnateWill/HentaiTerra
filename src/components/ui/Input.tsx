import React from 'react';
import { cn } from '@/lib/utils';
import { components } from '@/styles/design-system';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'outline';
  inputSize?: 'sm' | 'md' | 'lg';
  error?: boolean;
  helperText?: string;
  label?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant = 'default',
    inputSize = 'md',
    error = false,
    helperText,
    label,
    icon,
    iconPosition = 'left',
    id,
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
        'block text-sm font-medium text-white mb-2',
        error && 'text-red-400'
      )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className={cn(
          'absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400',
          inputSize === 'sm' && 'w-4 h-4',
          inputSize === 'md' && 'w-5 h-5',
          inputSize === 'lg' && 'w-6 h-6'
        )}>
              {icon}
            </div>
          )}
          <input
            id={inputId}
            className={cn(
          components.input.base,
          components.input.variants[variant as keyof typeof components.input.variants],
          inputSize === 'sm' && 'px-3 py-1.5 text-sm rounded-md',
          inputSize === 'md' && 'px-4 py-2.5 text-base rounded-lg',
          inputSize === 'lg' && 'px-5 py-3 text-lg rounded-xl',
          icon && iconPosition === 'left' && 'pl-10',
          icon && iconPosition === 'right' && 'pr-10',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
            ref={ref}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <div className={cn(
          'absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400',
          inputSize === 'sm' && 'w-4 h-4',
          inputSize === 'md' && 'w-5 h-5',
          inputSize === 'lg' && 'w-6 h-6'
        )}>
              {icon}
            </div>
          )}
        </div>
        {helperText && (
          <p className={cn(
          'mt-2 text-sm text-neutral-400',
          error && 'text-red-400'
        )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, type InputProps };