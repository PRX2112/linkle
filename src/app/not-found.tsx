import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-app-bg text-text-primary flex flex-col justify-between p-6 sm:p-12">
      {/* Brand Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center bg-brand-500/10 dark:bg-brand-500/20">
            <Image
              src="/logo.png"
              alt="Linkle"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
            Linkle<span className="text-brand-500">.</span>
          </span>
        </Link>
      </header>

      {/* Main 404 Content */}
      <main className="max-w-md mx-auto text-center py-12 space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/60 flex items-center justify-center mx-auto text-brand-600 dark:text-brand-400">
          <Compass className="w-7 h-7 animate-pulse" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            404 Error
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Page not found
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed pt-1">
            The page you are looking for doesn&apos;t exist, has been removed, or has moved to a new address.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-subtle transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200 text-xs font-semibold shadow-subtle transition-all"
          >
            <span>Go to Dashboard</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-gray-400 dark:text-zinc-500">
        <p>&copy; {new Date().getFullYear()} Linkle. All rights reserved.</p>
      </footer>
    </div>
  );
}
