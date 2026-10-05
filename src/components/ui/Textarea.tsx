import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean | string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, disabled, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500",
          "px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-zinc-700 transition-colors duration-150",
          "focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-brand-500/30",
          "disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed resize-y",
          error && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
