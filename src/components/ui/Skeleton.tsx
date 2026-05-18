import React from "react";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: "rectangular" | "circular" | "text";
  lines?: number;
}

// Base shimmer skeleton
export default function Skeleton({
  className = "",
  width,
  height,
  variant = "rectangular",
  lines = 1,
}: SkeletonProps) {
  const base = "shimmer bg-white/4 rounded";

  if (variant === "text") {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${base} ${className}`}
            style={{ width: i === lines - 1 && lines > 1 ? "70%" : width || "100%", height: height || "0.875rem", opacity: 1 - i * 0.1 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${base} ${variant === "circular" ? "rounded-full" : "rounded-xl"} ${className}`}
      style={{ width: width || "100%", height: height || "100%" }}
    />
  );
}

// Poster image skeleton
export function ImageSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-[#14161f] ${className}`}>
      <div className="absolute inset-0 shimmer" />
    </div>
  );
}

// Card skeleton (poster + title)
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <ImageSkeleton className="aspect-[2/3]" />
      <div className="space-y-1.5 px-0.5">
        <div className="h-3 shimmer bg-white/4 rounded-md w-full" />
        <div className="h-3 shimmer bg-white/4 rounded-md w-3/4" />
      </div>
    </div>
  );
}

// Grid skeleton
export function GridSkeleton({
  columns = 6,
  rows = 1,
  className = "",
}: {
  columns?: number;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 ${className}`}>
      {Array.from({ length: columns * rows }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Slider skeleton
export function SliderSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full h-[380px] sm:h-[440px] md:h-[500px] rounded-2xl overflow-hidden shimmer bg-[#14161f] ${className}`}>
      <div className="absolute bottom-8 left-8 space-y-3 w-72">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-5 w-14 shimmer bg-white/6 rounded-full" />)}
        </div>
        <div className="h-8 shimmer bg-white/6 rounded-lg w-full" />
        <div className="h-8 shimmer bg-white/6 rounded-lg w-4/5" />
        <div className="h-4 shimmer bg-white/4 rounded-md w-full" />
        <div className="h-4 shimmer bg-white/4 rounded-md w-3/4" />
        <div className="flex gap-3 mt-4">
          <div className="h-10 w-36 shimmer bg-white/8 rounded-full" />
          <div className="h-10 w-28 shimmer bg-white/5 rounded-full" />
        </div>
      </div>
    </div>
  );
}