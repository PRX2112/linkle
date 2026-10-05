"use client";

import React from "react";
import { Check, Type } from "lucide-react";

export const FONT_OPTIONS = [
  {
    id: "Inter",
    name: "Inter",
    category: "Modern Sans-serif",
    sample: "The quick brown fox jumps over the lazy dog",
    weight: "Default font. Clean, balanced, and readable at all sizes.",
  },
  {
    id: "Poppins",
    name: "Poppins",
    category: "Geometric Sans-serif",
    sample: "The quick brown fox jumps over the lazy dog",
    weight: "Friendly, contemporary, and versatile with round letterforms.",
  },
  {
    id: "DM Sans",
    name: "DM Sans",
    category: "Editorial Sans",
    sample: "The quick brown fox jumps over the lazy dog",
    weight: "Low-contrast precision crafted for modern portfolios and content.",
  },
  {
    id: "Space Grotesk",
    name: "Space Grotesk",
    category: "Tech Grotesk",
    sample: "The quick brown fox jumps over the lazy dog",
    weight: "Distinctive monospace-inspired aesthetic for developers and creators.",
  },
  {
    id: "Syne",
    name: "Syne",
    category: "Avant-garde Display",
    sample: "The quick brown fox jumps over the lazy dog",
    weight: "Artistic, bold, and high-impact design for fashion and culture.",
  },
  {
    id: "Playfair Display",
    name: "Playfair Display",
    category: "Classic Serif",
    sample: "The quick brown fox jumps over the lazy dog",
    weight: "Elegant transitional serif with sharp contrast and luxury flair.",
  },
  {
    id: "Roboto Mono",
    name: "Roboto Mono",
    category: "Technical Monospace",
    sample: "The quick brown fox jumps over the lazy dog",
    weight: "Engineered for clarity, terminal aesthetic, and technical bios.",
  },
] as const;

interface TypographySectionProps {
  currentFont: string;
  onChangeFont: (font: string) => void;
}

export function TypographySection({
  currentFont,
  onChangeFont,
}: TypographySectionProps) {
  return (
    <div className="space-y-6">
      {/* Dynamic Font Loader to render each font option in its real typeface */}
      <style
        dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&family=Poppins:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@500;600;700;800&display=swap');`,
        }}
      />

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-subtle space-y-5">
        <div className="border-b border-gray-100 dark:border-zinc-800/80 pb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Type className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Profile Typography
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Select the primary typeface that sets the tone for your public Linkle profile.
          </p>
        </div>

        {/* Font List */}
        <div className="space-y-2.5" role="radiogroup" aria-label="Profile typography options">
          {FONT_OPTIONS.map((font) => {
            const isSelected = currentFont.toLowerCase() === font.id.toLowerCase();

            return (
              <button
                key={font.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChangeFont(font.id)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
                  isSelected
                    ? "border-brand-500 bg-brand-50/30 dark:bg-brand-950/20 shadow-subtle ring-1 ring-brand-500/20"
                    : "border-gray-200/80 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                }`}
              >
                {/* Radio Circle Indicator */}
                <div
                  className={`w-5 h-5 rounded-full shrink-0 mt-0.5 flex items-center justify-center border transition-all ${
                    isSelected
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-gray-300 dark:border-zinc-600 bg-transparent"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className="text-base font-semibold text-gray-900 dark:text-gray-100 tracking-tight"
                      style={{ fontFamily: font.id }}
                    >
                      {font.name}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 font-medium">
                      {font.category}
                    </span>
                  </div>

                  <p
                    className="text-sm text-gray-700 dark:text-zinc-300 mb-1"
                    style={{ fontFamily: font.id }}
                  >
                    {font.sample}
                  </p>

                  <p className="text-xs text-gray-400 dark:text-zinc-500">
                    {font.weight}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
