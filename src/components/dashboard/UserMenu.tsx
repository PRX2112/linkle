"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  ExternalLink,
  Copy,
  Check,
  CreditCard,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

interface UserMenuProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
    displayName?: string | null;
    plan?: string | null;
  };
  isCollapsed?: boolean;
}

export function UserMenu({ user, isCollapsed = false }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const menuRef = useRef<HTMLDivElement>(null);

  const username = user.username?.trim();
  const profileUrl = typeof window !== "undefined" && username
    ? `${window.location.origin}/p/${username}`
    : username
    ? `https://linkle.app/p/${username}`
    : "";

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const initials = (() => {
    const nameStr = (user.displayName || user.name || user.username || "U").trim();
    const parts = nameStr.split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  })();

  const rawPlan = (user.plan || "STARTER").toUpperCase();
  const isPaid = rawPlan === "PRO" || rawPlan === "ENTERPRISE";
  const planLabel = rawPlan === "ENTERPRISE" ? "Enterprise" : rawPlan === "PRO" ? "Pro" : "Free";

  return (
    <div ref={menuRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={cn(
          "w-full flex items-center gap-3 p-2 rounded-xl transition-colors duration-150 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30",
          isOpen
            ? "bg-gray-100 dark:bg-zinc-800"
            : "hover:bg-gray-100/80 dark:hover:bg-zinc-800/60"
        )}
      >
        {/* Avatar */}
        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center shrink-0 border border-gray-300 dark:border-zinc-700">
          {user.image ? (
            <img
              src={user.image}
              alt={user.displayName || user.name || "User Avatar"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* User Details (Hidden if collapsed) */}
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {user.displayName || user.name || "User"}
              </span>
              <Badge
                variant={isPaid ? "brand" : "default"}
                size="sm"
                className="text-[10px] px-1.5 py-0 h-4 uppercase tracking-wider font-bold"
              >
                {planLabel}
              </Badge>
            </div>
            {username && (
              <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                @{username}
              </p>
            )}
          </div>
        )}

        {!isCollapsed && (
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-400 dark:text-zinc-500 transition-transform duration-200 shrink-0",
              isOpen && "rotate-180"
            )}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={cn(
            "absolute z-50 bottom-full mb-2 w-64 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-overlay p-1.5 text-sm animate-in fade-in zoom-in-95 duration-150 focus:outline-none",
            isCollapsed ? "left-0" : "left-0 right-0 w-full min-w-[240px]"
          )}
        >
          {/* Header Summary */}
          <div className="px-3 py-2.5 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                {user.displayName || user.name || "My Account"}
              </span>
              <Badge variant={isPaid ? "brand" : "default"} size="sm">
                {planLabel}
              </Badge>
            </div>
            {user.email && (
              <p className="text-xs text-gray-500 dark:text-zinc-400 truncate mt-0.5">
                {user.email}
              </p>
            )}
          </div>

          {/* Quick Profile Actions */}
          {username && (
            <div className="py-1">
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  View public profile
                </span>
                <span className="text-xs text-gray-400">linkle.app/p/{username}</span>
              </a>

              <button
                type="button"
                role="menuitem"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-colors text-left"
              >
                <span className="flex items-center gap-2">
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                  {copied ? "Link copied!" : "Copy profile link"}
                </span>
              </button>
            </div>
          )}

          <div className="h-px bg-gray-100 dark:border-zinc-800 my-1" />

          {/* Account Navigation */}
          <div className="py-1">
            <Link
              href="/dashboard/monetization"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span>Billing & Plans</span>
              {!isPaid && (
                <span className="ml-auto text-[11px] font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Upgrade
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/settings"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-400" />
              <span>Settings</span>
            </Link>
          </div>

          <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />

          {/* Sign Out */}
          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
