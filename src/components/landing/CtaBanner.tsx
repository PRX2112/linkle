import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface CtaBannerProps {
  session?: {
    user?: {
      username?: string | null;
      name?: string | null;
    };
  } | null;
}

export default function CtaBanner({ session }: CtaBannerProps) {
  return (
    <section className="py-16 sm:py-24 bg-gray-50/70 dark:bg-zinc-900/40 border-t border-gray-200/80 dark:border-zinc-800/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-b from-gray-900 to-black dark:from-zinc-900 dark:to-zinc-950 p-8 sm:p-14 text-center text-white relative overflow-hidden shadow-2xl border border-gray-800 dark:border-zinc-800">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Free to start • Live in 3 minutes</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Everything you need to share who you are.
            </h2>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Join creators, freelancers, and businesses who rely on Linkle for their links, portfolio, contacts, and zero-fee UPI payments.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href={session ? "/dashboard" : "/register"}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>{session ? "Go to Dashboard" : "Create your Linkle"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/p/demo"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-white/20 hover:bg-white/10 text-white font-semibold text-sm flex items-center justify-center transition-colors"
              >
                Explore Live Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
