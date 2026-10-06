import { UserCheck, Link2, Share2, ArrowRight } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    number: "01",
    title: "Claim your profile handle",
    description: "Choose your unique username (e.g. linklez.vercel.app/p/yourname), upload your avatar, and add your bio in seconds.",
    icon: UserCheck,
  },
  {
    number: "02",
    title: "Add links & UPI payments",
    description: "Connect your social channels, feature key projects, set up your UPI ID, and attach your digital contact card.",
    icon: Link2,
  },
  {
    number: "03",
    title: "Share your Linkle anywhere",
    description: "Put your link in your Instagram bio, X profile, resume, or download your high-res dynamic QR code for print.",
    icon: Share2,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-white dark:bg-zinc-950 border-t border-gray-200/80 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18 space-y-4">
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Simple 3-Step Setup
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Live in less than three minutes.
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            No complex setup, no web development required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative p-6 sm:p-8 rounded-2xl bg-gray-50/70 dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-2xl font-black text-gray-300 dark:text-zinc-700">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm hover:opacity-90 transition-opacity shadow-xs"
          >
            <span>Claim your Linkle now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
