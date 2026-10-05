"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight, ExternalLink } from "lucide-react";
import { NAV_ITEMS } from "@/lib/landing-content";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface LandingNavbarProps {
  session?: {
    user?: {
      username?: string | null;
      displayName?: string | null;
      name?: string | null;
    };
  } | null;
}

export default function LandingNavbar({ session }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-200/80 dark:border-zinc-800/80 shadow-xs"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg p-1"
          aria-label="Linkle Home"
        >
          <div className="relative w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center bg-brand-500/10 dark:bg-brand-500/20 group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/logo.png"
              alt="Linkle Logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <span className="font-bold text-xl sm:text-2xl tracking-tight text-gray-900 dark:text-white">
            Linkle<span className="text-brand-500">.</span>
          </span>
        </Link>

        {/* Desktop Nav Items */}
        <nav
          className="hidden md:flex items-center gap-1 lg:gap-2"
          aria-label="Main Navigation"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md transition-colors hover:bg-gray-100/60 dark:hover:bg-zinc-800/60"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/p/demo"
            className="px-3 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 rounded-md transition-colors hover:bg-brand-50 dark:hover:bg-brand-950/40 flex items-center gap-1"
          >
            <span>Live Demo</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {session ? (
            <div className="flex items-center gap-2.5">
              {session.user?.username && (
                <Link
                  href={`/p/${session.user.username}`}
                  target="_blank"
                  className="px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700"
                >
                  My Profile
                </Link>
              )}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-black dark:hover:bg-zinc-100 rounded-lg transition-all shadow-xs"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-all shadow-xs hover:shadow-sm"
              >
                <span>Create your Linkle</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navigation Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-w-[40px] min-h-[40px] p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 flex items-center justify-center"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-16 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md md:hidden flex flex-col justify-between p-6 pb-safe border-t border-gray-200 dark:border-zinc-800 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          <nav className="flex flex-col gap-2 pt-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 min-h-[44px] flex items-center text-base font-medium text-gray-800 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-50 dark:hover:bg-zinc-900/60 rounded-xl transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/p/demo"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 min-h-[44px] text-base font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50/60 dark:hover:bg-brand-950/30 rounded-xl transition-colors flex items-center justify-between"
            >
              <span>Live Demo Profile</span>
              <ExternalLink className="w-4 h-4 opacity-70" />
            </Link>
          </nav>

          <div className="pt-6 border-t border-gray-200 dark:border-zinc-800 flex flex-col gap-3">
            {session ? (
              <>
                {session.user?.username && (
                  <Link
                    href={`/p/${session.user.username}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 rounded-xl"
                  >
                    View My Public Profile
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 rounded-xl"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
                >
                  Create your Linkle
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
