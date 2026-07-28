"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LayoutGrid, Palette, ExternalLink, LogOut, QrCode, LayoutDashboard, Link as LinkIcon, BarChart3, CircleDollarSign, Settings } from "lucide-react";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string | null;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard/overview", icon: LayoutDashboard },
  { label: "My Links", href: "/dashboard", icon: LinkIcon },
  { label: "Appearance", href: "/dashboard/appearance", icon: Palette },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const renderSidebarContent = (onLinkClick?: () => void) => (
    <>
      {/* Logo */}
      <div className="mb-8 px-2 flex items-center justify-between">
        <Link href="/" onClick={onLinkClick} className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
            <Image src="/logo.png" alt="Linkle Logo" width={32} height={32} className="object-contain" priority />
          </div>
          <span className="font-bold text-2xl tracking-tighter gradient-text">Linkle.</span>
        </Link>
        {onLinkClick && (
          <button
            onClick={onLinkClick}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="mb-6 px-2 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500/40 flex items-center justify-center bg-gray-200 text-gray-600 font-bold text-lg mb-2">
          {user.image ? (
            <img src={user.image} alt="User avatar" className="w-full h-full object-cover" />
          ) : (
            (() => {
              const parts = (user.name ?? user.username ?? "?").trim().split(/\s+/);
              if (parts.length === 1) {
                return parts[0][0].toUpperCase();
              }
              return (parts[0][0] + parts[1][0]).toUpperCase();
            })()
          )}
        </div>
        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</div>
        {user.username && (
          <div className="text-xs text-gray-400 truncate">@{user.username}</div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "gradient-bg text-white shadow-glow"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="space-y-1 mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
        {user.username && (
          <Link
            href={`/p/${user.username}`}
            target="_blank"
            onClick={onLinkClick}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            View my Linkle
          </Link>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Sticky Navbar Header */}
      <header className="lg:hidden w-full h-16 fixed top-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center">
            <Image src="/logo.png" alt="Linkle Logo" width={28} height={28} className="object-contain" priority />
          </div>
          <span className="font-bold text-2xl tracking-tighter gradient-text">Linkle.</span>
        </Link>
        
        <div className="flex items-center gap-3">
          {user.username && (
            <Link
              href={`/p/${user.username}`}
              target="_blank"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
            >
              Live Site
            </Link>
          )}
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer (Overlay and Menu) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Menu Content Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-64 max-w-[280px] h-full bg-white dark:bg-zinc-900 flex flex-col p-4 shadow-2xl z-50"
            >
              {renderSidebarContent(() => setIsOpen(false))}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Permanent) */}
      <aside className="w-64 min-h-screen bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex-col p-4 sticky top-0 hidden lg:flex shrink-0">
        {renderSidebarContent()}
      </aside>
    </>
  );
}
