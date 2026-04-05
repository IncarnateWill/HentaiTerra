import React from "react";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: "rectangular" | "circular" | "text";
  lines?: number;
}

export default function Skeleton({ 
  className = "", 
  width, 
  height, 
  variant = "rectangular",
  lines = 1 
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-neutral-800/50";
  
  if (variant === "text") {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} rounded ${className}`}
            style={{
              width: width || "100%",
              height: height || "1rem",
              opacity: lines > 1 ? 1 - (i * 0.1) : 1
            }}
          />
        ))}
      </div>
    );
  }

  const shapeClasses = variant === "circular" ? "rounded-full" : "rounded";
  
  return (
    <div
      className={`${baseClasses} ${shapeClasses} ${className}`}
      style={{
        width: width || "100%",
        height: height || "100%"
      }}
    />
  );
}

// Specialized skeleton components
export function ImageSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Skeleton className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-700/20 to-transparent animate-shimmer" />
    </div>
  );
}

export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <ImageSkeleton className="aspect-[2/3] rounded-xl" />
      <Skeleton variant="text" lines={2} className="h-4" />
    </div>
  );
}

export function GridSkeleton({ 
  columns = 6, 
  rows = 1, 
  className = "" 
}: { 
  columns?: number; 
  rows?: number; 
  className?: string; 
}) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-${columns} gap-4 ${className}`}>
      {Array.from({ length: columns * rows }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
} 