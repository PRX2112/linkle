"use client";

import { useState } from "react";
import { AUDIENCE_ITEMS, AudienceItem } from "@/lib/landing-content";
import { Check, Sparkles } from "lucide-react";

export default function AudienceSection() {
  const [selectedId, setSelectedId] = useState<string>(AUDIENCE_ITEMS[0].id);
  const activeItem = AUDIENCE_ITEMS.find((a) => a.id === selectedId) || AUDIENCE_ITEMS[0];

  return (
    <section className="py-16 sm:py-24 bg-gray-50/60 dark:bg-zinc-900/30 border-t border-gray-200/80 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Who It&apos;s For
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Built for how modern professionals share.
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400">
            Select your discipline to see how Linkle streamlines your workflow.
          </p>
        </div>

        {/* Compact Audience Selector Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto mb-8">
          {AUDIENCE_ITEMS.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isSelected
                    ? "bg-brand-600 text-white shadow-xs scale-102"
                    : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600"
                }`}
              >
                {item.title}
              </button>
            );
          })}
        </div>

        {/* Active Persona Spotlight Card */}
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {activeItem.role}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                {activeItem.title}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold self-start sm:self-auto border border-emerald-200 dark:border-emerald-800/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeItem.badge}</span>
            </span>
          </div>

          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 py-4 leading-relaxed">
            {activeItem.description}
          </p>

          <div className="pt-2 flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-zinc-900 p-3.5 rounded-xl border border-gray-200/60 dark:border-zinc-800/60">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Key superpower: <strong>{activeItem.keyFeature}</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
}
