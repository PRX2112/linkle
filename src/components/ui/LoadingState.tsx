import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rectangle" | "circle" | "text";
}

export function Skeleton({
  className,
  variant = "rectangle",
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse bg-gray-200 dark:bg-zinc-800",
        variant === "circle" && "rounded-full",
        variant === "text" && "h-4 rounded-md w-full",
        variant === "rectangle" && "rounded-lg",
        className
      )}
      {...props}
    />
  );
}

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: "xs" | "sm" | "md" | "lg";
  label?: string;
}

export function Spinner({
  size = "md",
  label = "Loading...",
  className,
  ...props
}: SpinnerProps) {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div role="status" className="inline-flex items-center justify-center">
      <svg
        className={cn("animate-spin text-brand-600 dark:text-brand-400", sizeClasses[size], className)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        {...props}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}
