"use client";

import * as React from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  Eye,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDashboardPageMeta } from "@/lib/dashboard-nav";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface DashboardHeaderProps {
  user: {
    id: string;
    name?: string | null;
    username?: string | null;
    displayName?: string | null;
    plan?: string | null;
  };
  onOpenMobileMenu: () => void;
  onToggleMobilePreview: () => void;
  isMobilePreviewOpen?: boolean;
}

export function DashboardHeader({
  user,
  onOpenMobileMenu,
  onToggleMobilePreview,
  isMobilePreviewOpen = false,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const pageMeta = getDashboardPageMeta(pathname);
  const username = user.username?.trim();
  const profileUrl = typeof window !== "undefined" && username
    ? `${window.location.origin}/p/${username}`
    : username
      ? `https://linklez.vercel.app/p/${username}`
      : "";

  const handleCopyLink = async () => {
    if (!profileUrl) return;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.info("Profile link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy link to clipboard");
    }
  };

  const rawPlan = (user.plan || "STARTER").toUpperCase();
  const isPaid = rawPlan === "PRO" || rawPlan === "ENTERPRISE";

  return (
    <header className="sticky top-0 z-20 w-full h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 px-4 sm:px-6 md:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile Menu Trigger + Title Context */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden min-w-[38px] min-h-[38px] p-2 -ml-1 rounded-lg text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 flex items-center justify-center"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 truncate tracking-tight">
              {pageMeta.label}
            </h1>
            <span className="hidden md:inline-block w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700" />
            <p className="hidden md:block text-xs text-gray-500 dark:text-zinc-400 truncate max-w-sm">
              {pageMeta.description}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile Live Preview Toggle (< xl screens) */}
        <button
          type="button"
          onClick={onToggleMobilePreview}
          aria-label={isMobilePreviewOpen ? "Close preview" : "Open live preview"}
          className={cn(
            "xl:hidden flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-medium border transition-colors select-none",
            isMobilePreviewOpen
              ? "bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800"
              : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-750"
          )}
        >
          <Smartphone className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
          <span className="hidden sm:inline">Preview</span>
        </button>

        {/* Public Profile Shortcut */}
        {username && (
          <div className="hidden sm:flex items-center gap-1.5">
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-medium bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-750 transition-colors"
            >
              <span>linklez.vercel.app/p/{username}</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>

            <button
              type="button"
              onClick={handleCopyLink}
              title={copied ? "Link copied!" : "Copy profile URL"}
              className="min-w-[36px] min-h-[36px] p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700 transition-colors flex items-center justify-center"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}

        {/* Plan Status Chip */}
        <Link href="/dashboard/monetization" className="hidden sm:inline-flex">
          <Badge
            variant={isPaid ? "brand" : "default"}
            size="sm"
            className="cursor-pointer hover:opacity-85 transition-opacity gap-1"
          >
            {isPaid ? (
              <>
                <Sparkles className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                <span>{rawPlan}</span>
              </>
            ) : (
              <span>Free Plan</span>
            )}
          </Badge>
        </Link>
      </div>
    </header>
  );
}
