import Link from "next/link";
import Image from "next/image";
import { UserX, ArrowRight, Sparkles } from "lucide-react";

export default function ProfileNotFound() {
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

      {/* Main Profile Not Found Content */}
      <main className="max-w-md mx-auto text-center py-12 space-y-5">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center mx-auto text-gray-400 dark:text-zinc-500">
          <UserX className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            Profile Unavailable
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            This profile isn&apos;t available
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed pt-1">
            The link you followed may be incorrect, or this username hasn&apos;t been claimed yet.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-subtle transition-all"
          >
            <Sparkles className="w-4 h-4 text-brand-200" />
            <span>Claim your Linkle URL</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200 text-xs font-semibold shadow-subtle transition-all"
          >
            <span>Explore Linkle</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-70" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-gray-400 dark:text-zinc-500">
        <p>&copy; {new Date().getFullYear()} Linkle. The modern profile microsite.</p>
      </footer>
    </div>
  );
}
