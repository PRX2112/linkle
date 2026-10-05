import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

    const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-brand-600 hover:bg-brand-700 text-white shadow-subtle border border-brand-700/20 dark:bg-brand-500 dark:hover:bg-brand-600 dark:text-white",
      secondary:
        "bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700/70 shadow-subtle",
      outline:
        "bg-transparent text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800",
      ghost:
        "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white",
      destructive:
        "bg-red-600 hover:bg-red-700 text-white shadow-subtle border border-red-700/20 dark:bg-red-500 dark:hover:bg-red-600",
      link:
        "bg-transparent text-brand-600 dark:text-brand-400 hover:underline underline-offset-4 p-0 h-auto font-normal active:scale-100",
    };

    const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
      xs: "text-xs px-2.5 py-1 rounded-md gap-1.5 h-7",
      sm: "text-xs px-3 py-1.5 rounded-md gap-1.5 h-8 font-medium",
      md: "text-sm px-4 py-2 rounded-lg gap-2 h-10 font-medium",
      lg: "text-base px-5 py-2.5 rounded-lg gap-2.5 h-11 font-medium",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          variant !== "link" && sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
