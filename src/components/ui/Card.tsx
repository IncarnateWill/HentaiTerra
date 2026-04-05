import React from 'react';
import { cn } from '@/lib/utils';
import { components } from '@/styles/design-system';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  interactive?: boolean;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    hover = false,
    interactive = false,
    children,
    ...props
  }, ref) => {
    return (
      <div
        className={cn(
          components.card.base,
          components.card.variants[variant],
          components.card.sizes[size],
          hover && 'hover:shadow-xl hover:scale-[1.02]',
          interactive && 'cursor-pointer hover:shadow-xl hover:scale-[1.02]',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => {
    return (
      <div
        className={cn('border-b border-neutral-700/50 pb-4 mb-4', className)}
        ref={ref}
        {...props}
      >
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-neutral-400 mt-1">
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    );
  }
);

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('flex-1', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, align = 'left', children, ...props }, ref) => {
    return (
      <div
        className={cn(
          'border-t border-neutral-700/50 pt-4 mt-4',
    align === 'left' && 'justify-start',
    align === 'center' && 'justify-center',
    align === 'right' && 'justify-end',
    'flex items-center gap-2',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  type CardProps,
  type CardHeaderProps,
  type CardContentProps,
  type CardFooterProps,
};