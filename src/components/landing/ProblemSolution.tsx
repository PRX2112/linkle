import { XCircle, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ProblemSolution() {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            The Link-In-Bio Dilemma
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Your audience shouldn&apos;t have to search for you.
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Scattering links across Instagram, LinkedIn, YouTube, and email signatures fragments your brand and costs you clients. Linkle unites everything in one polished place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* The Old Fragmented Way */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gray-50/80 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                ✕
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Fragmented Presence
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Standard bio link list tools
                </p>
              </div>
            </div>

            <ul className="space-y-3.5 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2.5">
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>Endless generic list of identical buttons that visitors scroll past.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>Heavy platform commissions (5% to 15%) on tips and digital sales.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>No direct phone contact saving; visitors have to manually copy numbers.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>Locked behind rigid, cookie-cutter templates with intrusive watermarks.</span>
              </li>
            </ul>
          </div>

          {/* The Linkle Way */}
          <div className="p-6 sm:p-8 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border-2 border-brand-500/40 dark:border-brand-500/30 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  The Linkle Experience
                </h3>
                <p className="text-xs text-brand-700 dark:text-brand-300 font-medium">
                  A high-converting personal microsite
                </p>
              </div>
            </div>

            <ul className="space-y-3.5 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Featured visual hierarchy</strong> that guides visitors to your top CTA in 3 seconds.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>0% fee Linkle Pay UPI</strong>: direct peer-to-peer payments straight to your bank account.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>1-Tap vCard 3.0</strong>: saves your full contact card into iOS & Android phone address books.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Tailored brand identity</strong> with custom fonts, button geometries, and hex color injection.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 group"
          >
            <span>See how easy it is to switch to Linkle</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
