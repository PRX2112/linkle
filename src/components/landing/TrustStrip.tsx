import { CreditCard, QrCode, BarChart3, Palette, Zap } from "lucide-react";
import { TRUST_ITEMS } from "@/lib/landing-content";

const ICON_MAP = {
  CreditCard,
  QrCode,
  BarChart3,
  Palette,
  Zap,
  ShieldCheck: Zap,
};

export default function TrustStrip() {
  return (
    <section className="border-y border-gray-200/80 dark:border-zinc-800/80 bg-gray-50/70 dark:bg-zinc-900/40 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-6">
          Everything built into every Linkle profile
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8">
          {TRUST_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.iconName] || Zap;
            return (
              <div
                key={item.title}
                className="flex flex-col items-center text-center p-3 rounded-xl transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700/80 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3 shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed max-w-[200px]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
