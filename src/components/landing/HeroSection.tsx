import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import HeroProfilePreview from "./HeroProfilePreview";

interface HeroSectionProps {
  session?: {
    user?: {
      username?: string | null;
      name?: string | null;
    };
  } | null;
}

export default function HeroSection({ session }: HeroSectionProps) {
  return (
    <section className="relative pt-8 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Messaging & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6 sm:space-y-8">
            {/* Pill / Category Label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/60 text-xs sm:text-sm font-semibold text-brand-700 dark:text-brand-300 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Next-Gen Link-in-Bio & Personal Microsite</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.12]">
              Your profile, links, contacts and payments —{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 dark:from-brand-400 dark:via-indigo-400 dark:to-purple-400">
                all in one place.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Create a clean, high-converting Linkle page you can share everywhere.
              Showcase your work, collect zero-fee UPI payments, save direct contact cards,
              and track visitor analytics in real time.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <Link
                href={session ? "/dashboard" : "/register"}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <span>{session ? "Go to Dashboard" : "Create your Linkle"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/p/demo"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-200 font-semibold text-base flex items-center justify-center transition-colors"
              >
                Explore Live Demo
              </Link>
            </div>

            {/* Trust Micro-Copy */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-gray-600 dark:text-gray-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Free forever Starter plan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>0% fee on UPI payments</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Product Preview */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <HeroProfilePreview />
          </div>
        </div>
      </div>
    </section>
  );
}
