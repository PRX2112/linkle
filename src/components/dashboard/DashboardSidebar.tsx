"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutGrid, Palette, ExternalLink, LogOut, QrCode, LayoutDashboard, Link as LinkIcon, BarChart3, CircleDollarSign, Settings } from "lucide-react";

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

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col p-4 sticky top-0">
      {/* Logo */}
      <div className="mb-8 px-2">
        <Link href="/" className="font-bold text-2xl tracking-tighter gradient-text">Linkle.</Link>
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
    </aside>
  );
}
