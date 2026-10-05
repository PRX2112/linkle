import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean | string;
  selectSize?: "sm" | "md" | "lg";
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, disabled, selectSize = "md", ...props }, ref) => {
    const sizeStyles = {
      sm: "h-8 pl-2.5 pr-8 text-xs rounded-md",
      md: "h-10 pl-3.5 pr-9 text-sm rounded-lg",
      lg: "h-11 pl-4 pr-10 text-base rounded-lg",
    };

    return (
      <div className="relative w-full">
        <select
          ref={ref}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={cn(
            "w-full appearance-none bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100",
            "border border-gray-200 dark:border-zinc-700 transition-colors duration-150 cursor-pointer",
            "focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-brand-500/30",
            "disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed",
            error && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20",
            sizeStyles[selectSize],
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400 dark:text-zinc-500">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";
