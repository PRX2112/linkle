import { Globe, Share2, CreditCard, QrCode, BarChart2, Mail, CheckCircle2 } from "lucide-react";
import { CORE_FEATURES } from "@/lib/landing-content";

const ICON_MAP = {
  Globe,
  Share2,
  CreditCard,
  QrCode,
  BarChart2,
  Mail,
};

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18 space-y-4">
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Core Differentiators
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Engineered for clarity, conversion, and trust.
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Every feature in Linkle is built to help your visitors take action quickly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {CORE_FEATURES.map((feature) => {
            const Icon = ICON_MAP[feature.iconName] || Globe;
            return (
              <div
                key={feature.id}
                className="group p-6 sm:p-7 rounded-2xl bg-gray-50/60 dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700/80 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                    {feature.description}
                  </p>
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-gray-200/60 dark:border-zinc-800/60">
                  {feature.bulletPoints.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
