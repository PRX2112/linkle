"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
  id?: string;
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  size = "md",
  className,
  id,
}: ToggleProps) {
  const generatedId = React.useId();
  const toggleId = id || generatedId;

  const isSm = size === "sm";

  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={toggleId}
              className={cn(
                "text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer select-none",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <span
              className={cn(
                "text-xs text-gray-500 dark:text-zinc-400 mt-0.5",
                disabled && "opacity-50"
              )}
            >
              {description}
            </span>
          )}
        </div>
      )}

      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed",
          isSm ? "h-5 w-9" : "h-6 w-11",
          checked
            ? "bg-brand-600 dark:bg-brand-500"
            : "bg-gray-200 dark:bg-zinc-700"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out",
            isSm ? "h-4 w-4" : "h-5 w-5",
            checked
              ? isSm
                ? "translate-x-4"
                : "translate-x-5"
              : "translate-x-0.5 mt-0.5 ml-0"
          )}
          style={{
            marginTop: isSm ? "2px" : "2px",
            marginLeft: checked ? "" : isSm ? "2px" : "2px",
          }}
        />
      </button>
    </div>
  );
}
