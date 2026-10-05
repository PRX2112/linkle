import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, TriangleAlert, X } from "lucide-react";

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: "info" | "success" | "warning" | "error";
  title?: React.ReactNode;
  onClose?: () => void;
}

export function Alert({
  className,
  variant = "info",
  title,
  children,
  onClose,
  ...props
}: AlertProps) {
  const icons = {
    info: <Info className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />,
    success: <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />,
    warning: <TriangleAlert className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />,
  };

  const variants = {
    info: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200",
    success: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200",
    warning: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200",
    error: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200",
  };

  const isAlert = variant === "error" || variant === "warning";

  return (
    <div
      role={isAlert ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border text-sm transition-all duration-150 relative",
        variants[variant],
        className
      )}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1">
        {title && <h5 className="font-semibold leading-tight mb-1">{title}</h5>}
        <div className="text-xs sm:text-sm leading-relaxed opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
