"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DASHBOARD_NAV_GROUPS, DashboardNavItem } from "@/lib/dashboard-nav";
import { UserMenu } from "./UserMenu";
import { Tooltip } from "@/components/ui/Tooltip";
import { Badge } from "@/components/ui/Badge";

interface DashboardSidebarProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
    displayName?: string | null;
    plan?: string | null;
    subscription?: any | null;
  };
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function DashboardSidebar({
  user,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const rawPlan = (user.plan || "STARTER").toUpperCase();
  const isPaid = rawPlan === "PRO" || rawPlan === "ENTERPRISE";

  const renderNavItem = (item: DashboardNavItem, inMobile = false) => {
    const isActive = item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

    const Icon = item.icon;

    const linkContent = (
      <Link
        key={item.href}
        href={item.href}
        onClick={onCloseMobile}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 select-none group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30",
          inMobile && "min-h-[40px]",
          isCollapsed && !inMobile && "justify-center px-0 h-10 w-10 mx-auto",
          isActive
            ? "bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold"
            : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100/80 dark:hover:bg-zinc-800/60 font-medium"
        )}
      >
        {/* Left active border indicator (when not collapsed or in mobile) */}
        {isActive && (!isCollapsed || inMobile) && (
          <span
            className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-brand-600 dark:bg-brand-500 rounded-r-full"
            aria-hidden="true"
          />
        )}

        <Icon
          className={cn(
            "w-4 h-4 shrink-0 transition-colors",
            isActive
              ? "text-brand-600 dark:text-brand-400"
              : "text-gray-500 dark:text-zinc-400 group-hover:text-gray-700 dark:group-hover:text-zinc-200"
          )}
        />

        {(!isCollapsed || inMobile) && (
          <span className="truncate">{item.label}</span>
        )}
      </Link>
    );

    // If collapsed desktop, wrap in Tooltip for accessibility
    if (isCollapsed && !inMobile) {
      return (
        <Tooltip key={item.href} content={item.label} position="right">
          {linkContent}
        </Tooltip>
      );
    }

    return linkContent;
  };

  const sidebarContent = (inMobile = false) => (
    <div className="flex flex-col h-full justify-between">
      {/* Top Header & Brand */}
      <div>
        <div
          className={cn(
            "flex items-center justify-between pb-6 pt-1 border-b border-gray-100 dark:border-zinc-800/80 mb-5",
            isCollapsed && !inMobile ? "px-1 justify-center" : "px-3"
          )}
        >
          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 rounded-lg p-0.5"
          >
            <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle group-hover:border-brand-300 transition-colors">
              <Image
                src="/logo.png"
                alt="Linkle"
                width={26}
                height={26}
                className="object-contain"
                priority
              />
            </div>
            {(!isCollapsed || inMobile) && (
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                Linkle<span className="text-brand-600 dark:text-brand-400">.</span>
              </span>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          {!inMobile && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={cn(
                "p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30",
                isCollapsed && "hidden"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Close Button */}
          {inMobile && onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation"
              className="min-w-[38px] min-h-[38px] p-2 rounded-lg text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Collapsed Expand Trigger */}
        {!inMobile && isCollapsed && onToggleCollapse && (
          <div className="flex justify-center mb-4">
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Sections */}
        <nav
          className="space-y-6 px-1"
          aria-label="Sidebar Navigation"
        >
          {DASHBOARD_NAV_GROUPS.map((group) => (
            <div key={group.id} className="space-y-1">
              {(!isCollapsed || inMobile) ? (
                <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-gray-400 dark:text-zinc-500 uppercase">
                  {group.label}
                </div>
              ) : (
                <div className="h-px bg-gray-200 dark:bg-zinc-800 my-2 mx-2" />
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => renderNavItem(item, inMobile))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="pt-4 border-t border-gray-100 dark:border-zinc-800/80 px-1 space-y-3">
        {/* Compact Plan Card (Hidden in collapsed desktop) */}
        {(!isCollapsed || inMobile) && (
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-850 border border-gray-200/70 dark:border-zinc-800/80 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {isPaid ? `${rawPlan} Plan` : "Starter Plan"}
              </span>
              <Badge variant={isPaid ? "brand" : "default"} size="sm">
                {isPaid ? "Active" : "Free"}
              </Badge>
            </div>
            <p className="text-gray-500 dark:text-zinc-400 text-[11px] leading-relaxed">
              {isPaid
                ? "All premium features & unlimited links unlocked."
                : "Limited to 5 links & 7-day analytics."}
            </p>
            {!isPaid && (
              <Link
                href="/dashboard/monetization"
                onClick={onCloseMobile}
                className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
              >
                <Sparkles className="w-3 h-3" />
                Upgrade for unlimited & Pro tools &rarr;
              </Link>
            )}
          </div>
        )}

        {/* User Account / Profile Menu */}
        <UserMenu user={user} isCollapsed={isCollapsed && !inMobile} />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer (Only mounted/active on mobile) */}
      {isMobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 lg:hidden flex"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <aside className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 shadow-modal flex flex-col p-4 pb-safe z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Desktop Sidebar (Permanent) */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 sticky top-0 h-screen shrink-0 transition-all duration-200 ease-in-out z-30 p-3",
          isCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        {sidebarContent(false)}
      </aside>
    </>
  );
}
