'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Performance monitoring - log error
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-neutral-900/80 rounded-xl border border-red-500/30">
          <div className="text-red-400 text-xl mb-4">⚠️ Ceva nu a mers bine</div>
          <p className="text-gray-300 text-center mb-4">
            Ne pare rău, dar a apărut o eroare neașteptată.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Reîncarcă pagina
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Functional error boundary hook for simpler usage
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: T) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Performance monitoring hook
export function usePerformanceMonitoring(componentName: string) {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Log slow renders (>100ms)
      if (renderTime > 100) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'timing_complete', {
            name: 'component_render',
            value: Math.round(renderTime),
            event_category: 'performance',
            custom_parameter: componentName
          });
        }
      }
    };
  }, [componentName]);
}