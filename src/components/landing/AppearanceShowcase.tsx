"use client";

import { useState } from "react";
import { Palette, Check, Sparkles } from "lucide-react";

interface ThemePreset {
  id: string;
  name: string;
  primaryColor: string;
  bgClass: string;
  cardBg: string;
  textColor: string;
  buttonShape: "pill" | "rounded" | "square" | "outline";
  fontFamily: string;
}

const THEME_PRESETS: ThemePreset[] = [
  {
    id: "minimal-dark",
    name: "Obsidian",
    primaryColor: "#6366f1",
    bgClass: "bg-zinc-950 text-white border-zinc-800",
    cardBg: "bg-zinc-900 border-zinc-800 text-white",
    textColor: "text-zinc-400",
    buttonShape: "rounded",
    fontFamily: "Inter",
  },
  {
    id: "creator-vibrant",
    name: "Neo Violet",
    primaryColor: "#a855f7",
    bgClass: "bg-gradient-to-b from-purple-950 via-zinc-950 to-zinc-950 text-white border-purple-900/50",
    cardBg: "bg-purple-950/40 border-purple-800/40 text-white",
    textColor: "text-purple-300",
    buttonShape: "pill",
    fontFamily: "Outfit",
  },
  {
    id: "clean-editorial",
    name: "Editorial",
    primaryColor: "#0f172a",
    bgClass: "bg-[#f8fafc] text-slate-900 border-slate-200",
    cardBg: "bg-white border-slate-200 text-slate-900",
    textColor: "text-slate-600",
    buttonShape: "square",
    fontFamily: "Playfair Display",
  },
  {
    id: "emerald-pro",
    name: "Emerald Studio",
    primaryColor: "#059669",
    bgClass: "bg-[#064e3b]/10 text-emerald-950 dark:text-emerald-100 border-emerald-500/20",
    cardBg: "bg-white dark:bg-zinc-900 border-emerald-500/30 text-zinc-900 dark:text-white",
    textColor: "text-emerald-700 dark:text-emerald-400",
    buttonShape: "outline",
    fontFamily: "Plus Jakarta Sans",
  },
];

export default function AppearanceShowcase() {
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset>(THEME_PRESETS[0]);

  return (
    <section id="customization" className="py-16 sm:py-24 bg-gray-50/70 dark:bg-zinc-900/40 border-t border-gray-200/80 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Appearance & Personalization
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Your personal brand, without compromise.
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Tailor your profile with 4 button geometries, custom brand colors, curated font pairings, and responsive theme layouts.
          </p>
        </div>

        {/* Theme Selector Strip */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10 max-w-2xl mx-auto">
          {THEME_PRESETS.map((preset) => {
            const isSelected = preset.id === selectedTheme.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedTheme(preset)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                  isSelected
                    ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white border-brand-500 shadow-sm ring-2 ring-brand-500/20"
                    : "bg-white/80 dark:bg-zinc-900/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-800 hover:border-gray-300"
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
                  style={{ backgroundColor: preset.primaryColor }}
                />
                <span>{preset.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-brand-500" />}
              </button>
            );
          })}
        </div>

        {/* Live Theme Preview Sandbox */}
        <div className="max-w-md mx-auto p-6 sm:p-8 rounded-3xl border shadow-xl transition-all duration-300 relative overflow-hidden"
          style={{ fontFamily: selectedTheme.fontFamily }}
        >
          <div className={`p-6 rounded-2xl border ${selectedTheme.bgClass} transition-colors duration-300`}>
            {/* Mock Header */}
            <div className="text-center space-y-2 mb-6">
              <div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white font-bold text-lg shadow-sm"
                style={{ backgroundColor: selectedTheme.primaryColor }}
              >
                LP
              </div>
              <h4 className="font-bold text-lg">Morgan Vance</h4>
              <p className={`text-xs ${selectedTheme.textColor}`}>
                Photographer & Visual Artist • NYC
              </p>
            </div>

            {/* Mock Link Cards Matching Selected Button Shape */}
            <div className="space-y-3">
              <div
                className={`p-3 border text-xs font-semibold text-center transition-all ${selectedTheme.cardBg} ${
                  selectedTheme.buttonShape === "pill"
                    ? "rounded-full"
                    : selectedTheme.buttonShape === "rounded"
                    ? "rounded-xl"
                    : selectedTheme.buttonShape === "square"
                    ? "rounded-none"
                    : "rounded-xl border-2 bg-transparent"
                }`}
              >
                Explore 2026 Portfolio Gallery
              </div>

              <div
                className={`p-3 border text-xs font-semibold text-center transition-all ${selectedTheme.cardBg} ${
                  selectedTheme.buttonShape === "pill"
                    ? "rounded-full"
                    : selectedTheme.buttonShape === "rounded"
                    ? "rounded-xl"
                    : selectedTheme.buttonShape === "square"
                    ? "rounded-none"
                    : "rounded-xl border-2 bg-transparent"
                }`}
              >
                Book Commercial Photoshoot
              </div>

              <div
                className={`p-3 text-xs font-semibold text-center text-white transition-all shadow-xs ${
                  selectedTheme.buttonShape === "pill"
                    ? "rounded-full"
                    : selectedTheme.buttonShape === "rounded"
                    ? "rounded-xl"
                    : selectedTheme.buttonShape === "square"
                    ? "rounded-none"
                    : "rounded-xl"
                }`}
                style={{ backgroundColor: selectedTheme.primaryColor }}
              >
                Pay Retainer via UPI (0% Fee)
              </div>
            </div>

            {/* Settings Indicators */}
            <div className="mt-6 pt-4 border-t border-current/10 flex items-center justify-between text-[10px] font-mono opacity-70">
              <span>Font: {selectedTheme.fontFamily}</span>
              <span className="capitalize">Style: {selectedTheme.buttonShape}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
