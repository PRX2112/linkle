"use client";

import * as React from "react";
import { createContext, useContext } from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  variant?: "pill" | "underline";
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  variant?: "pill" | "underline";
  className?: string;
  children: React.ReactNode;
}

export function Tabs({
  value,
  onValueChange,
  variant = "pill",
  className,
  children,
}: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange, variant }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function TabsList({ className, children, ...props }: TabsListProps) {
  const ctx = useContext(TabsContext);
  const isPill = ctx?.variant === "pill";

  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center",
        isPill &&
          "p-1 bg-gray-100 dark:bg-zinc-800 rounded-lg gap-1 overflow-x-auto no-scrollbar",
        !isPill &&
          "border-b border-gray-200 dark:border-zinc-800 gap-6 overflow-x-auto no-scrollbar",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: React.ReactNode;
}

export function TabsTrigger({
  value,
  icon,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = ctx.value === value;
  const isPill = ctx.variant === "pill";

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        "flex items-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30",
        isPill && [
          "px-3.5 py-1.5 rounded-md",
          isActive
            ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 shadow-subtle font-semibold"
            : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-700/40",
        ],
        !isPill && [
          "pb-3 pt-1 border-b-2 font-medium -mb-px",
          isActive
            ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400 font-semibold"
            : "border-transparent text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:border-gray-300 dark:hover:border-zinc-700",
        ],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

export interface TabsContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: TabsContentProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be used within Tabs");

  if (ctx.value !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn("mt-4 focus-visible:outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}
