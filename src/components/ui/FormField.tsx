import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: string | boolean;
}

export function FormField({ className, children, error, ...props }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5 w-full", className)} {...props}>
      {children}
    </div>
  );
}

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FormLabel({
  className,
  required,
  children,
  ...props
}: FormLabelProps) {
  return (
    <label
      className={cn(
        "block text-xs font-semibold tracking-wide text-gray-700 dark:text-zinc-300 uppercase",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
    </label>
  );
}

export function FormHelperText({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs text-gray-500 dark:text-zinc-400 mt-1", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function FormErrorMessage({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null;

  return (
    <p
      role="alert"
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 mt-1",
        className
      )}
      {...props}
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
