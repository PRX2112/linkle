"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import DashboardSidebar from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import MobilePreview from "./MobilePreview";
import { X, Smartphone } from "lucide-react";

interface DashboardShellProps {
  user: any;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  // Restore collapsed state preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("linkle_sidebar_collapsed");
      if (saved === "true") {
        setIsCollapsed(true);
      }
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("linkle_sidebar_collapsed", String(next));
      } catch (e) {
        // ignore storage errors
      }
      return next;
    });
  };

  // Close overlays on navigation
  useEffect(() => {
    setIsMobileNavOpen(false);
    setIsMobilePreviewOpen(false);
  }, [pathname]);

  // Handle Escape key for overlays
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isMobileNavOpen) setIsMobileNavOpen(false);
        if (isMobilePreviewOpen) setIsMobilePreviewOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileNavOpen, isMobilePreviewOpen]);

  // Lock body scroll when mobile overlays are active
  useEffect(() => {
    if (isMobileNavOpen || isMobilePreviewOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileNavOpen, isMobilePreviewOpen]);

  return (
    <div className="min-h-screen bg-app-bg flex text-text-primary relative selection:bg-brand-500 selection:text-white">
      {/* Sidebar & Mobile Drawer Navigation */}
      <DashboardSidebar
        user={user}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <DashboardHeader
          user={user}
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
          onToggleMobilePreview={() => setIsMobilePreviewOpen((prev) => !prev)}
          isMobilePreviewOpen={isMobilePreviewOpen}
        />

        {/* Workspace + Live Preview Side by Side */}
        <div className="flex-1 flex flex-col xl:flex-row min-w-0">
          {/* Main Editing Workspace */}
          <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 pb-20 w-full min-w-0 max-w-5xl">
            {children}
          </main>

          {/* Desktop Live Preview Panel */}
          <aside
            className="hidden xl:flex w-[380px] 2xl:w-[420px] shrink-0 border-l border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/40 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar justify-center items-start"
            aria-label="Live Profile Preview"
          >
            <MobilePreview />
          </aside>
        </div>
      </div>

      {/* Mobile/Tablet Preview Modal/Sheet (< xl) */}
      {isMobilePreviewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 xl:hidden flex flex-col bg-white dark:bg-zinc-950 animate-in fade-in duration-200"
        >
          {/* Top Bar for Mobile Preview */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shrink-0 pt-safe">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Live Profile Preview
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobilePreviewOpen(false)}
              className="min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close Preview</span>
            </button>
          </div>

          {/* Preview Viewport */}
          <div className="flex-1 overflow-y-auto p-4 pb-safe flex justify-center items-start">
            <MobilePreview />
          </div>
        </div>
      )}
    </div>
  );
}
