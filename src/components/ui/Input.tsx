import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  inputSize?: "sm" | "md" | "lg";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      error,
      type = "text",
      leftAddon,
      rightAddon,
      inputSize = "md",
      disabled,
      ...props
    },
    ref
  ) => {
    const hasAddon = Boolean(leftAddon || rightAddon);

    const sizeStyles = {
      sm: "h-8 px-2.5 text-xs rounded-md",
      md: "h-10 px-3.5 text-sm rounded-lg",
      lg: "h-11 px-4 text-base rounded-lg",
    };

    const inputClasses = cn(
      "w-full bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500",
      "border border-gray-200 dark:border-zinc-700 transition-colors duration-150",
      "focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-brand-500/30",
      "disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed",
      error && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20",
      !hasAddon && sizeStyles[inputSize],
      hasAddon && "h-full bg-transparent border-0 focus:ring-0 focus:border-0 rounded-none px-3",
      className
    );

    if (hasAddon) {
      return (
        <div
          className={cn(
            "flex items-center w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 transition-colors duration-150",
            "focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 dark:focus-within:ring-brand-500/30 overflow-hidden",
            inputSize === "sm" && "h-8 rounded-md text-xs",
            inputSize === "md" && "h-10 rounded-lg text-sm",
            inputSize === "lg" && "h-11 rounded-lg text-base",
            error && "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20",
            disabled && "opacity-50 bg-gray-50 dark:bg-zinc-800 cursor-not-allowed"
          )}
        >
          {leftAddon && (
            <div className="flex items-center justify-center px-3 bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-r border-gray-200 dark:border-zinc-700 shrink-0 text-sm font-medium">
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className={inputClasses}
            {...props}
          />
          {rightAddon && (
            <div className="flex items-center justify-center px-3 bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-l border-gray-200 dark:border-zinc-700 shrink-0 text-sm font-medium">
              {rightAddon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        className={inputClasses}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
