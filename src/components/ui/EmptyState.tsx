import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl border border-dashed border-gray-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50",
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 flex items-center justify-center mb-4 shrink-0">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-sm mt-1 mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
