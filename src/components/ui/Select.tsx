import React from 'react';
import { cn } from '@/lib/utils';
import { components } from '@/styles/design-system';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'default' | 'filled' | 'outline';
  selectSize?: 'sm' | 'md' | 'lg';
  error?: boolean;
  helperText?: string;
  label?: string;
  placeholder?: string;
  options: SelectOption[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({
    className,
    variant = 'default',
    selectSize = 'md',
    error = false,
    helperText,
    label,
    placeholder,
    options,
    id,
    ...props
  }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
        'block text-sm font-medium text-white mb-2',
        error && 'text-red-400'
      )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            className={cn(
          components.input.base,
          components.input.variants[variant as keyof typeof components.input.variants],
          selectSize === 'sm' && 'px-3 py-1.5 text-sm rounded-md',
          selectSize === 'md' && 'px-4 py-2.5 text-base rounded-lg',
          selectSize === 'lg' && 'px-5 py-3 text-lg rounded-xl',
          'appearance-none bg-no-repeat bg-right pr-10 cursor-pointer',
          'bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")]',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
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

Select.displayName = 'Select';

export { Select, type SelectProps, type SelectOption };