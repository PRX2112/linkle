"use client";

import React, { useState } from "react";
import { Check, Palette, RotateCcw, Shapes } from "lucide-react";

export const THEME_PRESETS = [
  {
    id: "indigo",
    name: "Indigo",
    color: "#6366f1",
    preview: "from-indigo-500 to-purple-600",
  },
  {
    id: "rose",
    name: "Rose",
    color: "#f43f5e",
    preview: "from-rose-500 to-pink-600",
  },
  {
    id: "amber",
    name: "Amber",
    color: "#f59e0b",
    preview: "from-amber-400 to-orange-500",
  },
  {
    id: "emerald",
    name: "Emerald",
    color: "#10b981",
    preview: "from-emerald-400 to-teal-500",
  },
  {
    id: "sky",
    name: "Sky",
    color: "#0ea5e9",
    preview: "from-sky-400 to-blue-500",
  },
  {
    id: "fuchsia",
    name: "Fuchsia",
    color: "#d946ef",
    preview: "from-fuchsia-500 to-pink-500",
  },
  {
    id: "cyan",
    name: "Cyan",
    color: "#06b6d4",
    preview: "from-cyan-400 to-sky-500",
  },
  {
    id: "neutral",
    name: "Minimal",
    color: "#737373",
    preview: "from-neutral-500 to-stone-600",
  },
] as const;

export const BUTTON_STYLES = [
  {
    id: "pill",
    name: "Pill",
    description: "Fully rounded capsules",
    previewClass: "rounded-full",
  },
  {
    id: "rounded",
    name: "Rounded",
    description: "Softly curved corners",
    previewClass: "rounded-xl",
  },
  {
    id: "square",
    name: "Square",
    description: "Crisp architectural corners",
    previewClass: "rounded-none",
  },
  {
    id: "outline",
    name: "Outline",
    description: "Transparent fill with colored border",
    previewClass: "rounded-xl border-2",
  },
] as const;

interface DesignSectionProps {
  primaryColor: string;
  buttonStyle: string;
  onChangeColor: (color: string) => void;
  onChangeButtonStyle: (style: string) => void;
}

export function DesignSection({
  primaryColor,
  buttonStyle,
  onChangeColor,
  onChangeButtonStyle,
}: DesignSectionProps) {
  const [hexInput, setHexInput] = useState(primaryColor);
  const [hexError, setHexError] = useState("");

  // Sync internal hex text if primaryColor changes via presets
  React.useEffect(() => {
    setHexInput(primaryColor);
    setHexError("");
  }, [primaryColor]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (!val.startsWith("#") && val.length > 0) {
      val = "#" + val;
    }
    setHexInput(val);

    const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val);
    if (isValidHex) {
      setHexError("");
      onChangeColor(val.toLowerCase());
    } else {
      setHexError("Please enter a valid hex color code (e.g. #6366F1)");
    }
  };

  const handleResetColor = () => {
    onChangeColor("#6366f1");
    setHexInput("#6366f1");
    setHexError("");
  };

  return (
    <div className="space-y-6">
      {/* Theme Presets Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-subtle space-y-5">
        <div className="border-b border-gray-100 dark:border-zinc-800/80 pb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Palette className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Color Themes
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Select a curated palette or customize your brand accent color.
          </p>
        </div>

        {/* Presets Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {THEME_PRESETS.map((preset) => {
            const isSelected = primaryColor.toLowerCase() === preset.color.toLowerCase();

            return (
              <button
                key={preset.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChangeColor(preset.color)}
                className={`relative flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
                  isSelected
                    ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-gray-900 dark:text-gray-100 shadow-subtle"
                    : "border-gray-200/80 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300"
                }`}
              >
                {/* Visual Color Dot */}
                <div
                  className="w-7 h-7 rounded-full shrink-0 shadow-inner flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: preset.color }}
                >
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-white drop-shadow stroke-[3]" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate leading-tight">
                    {preset.name}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono mt-0.5">
                    {preset.color}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Accent Color Picker */}
        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/80">
          <label
            htmlFor="customColorHex"
            className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2"
          >
            Custom Accent Hex
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2.5">
              {/* Native Color Picker overlay */}
              <div className="relative w-9 h-9 rounded-lg border border-gray-300 dark:border-zinc-700 overflow-hidden shrink-0 shadow-subtle">
                <div
                  className="w-full h-full"
                  style={{ backgroundColor: primaryColor }}
                />
                <input
                  type="color"
                  value={primaryColor.startsWith("#") ? primaryColor : "#6366f1"}
                  onChange={(e) => onChangeColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title="Pick a custom color"
                  aria-label="Pick custom color"
                />
              </div>

              {/* Hex Input */}
              <input
                id="customColorHex"
                type="text"
                value={hexInput}
                onChange={handleHexChange}
                maxLength={7}
                placeholder="#6366F1"
                className="w-28 px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono uppercase text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>

            <button
              type="button"
              onClick={handleResetColor}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 transition-colors self-start sm:self-auto sm:ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to default
            </button>
          </div>

          {hexError && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1.5">
              {hexError}
            </p>
          )}
        </div>
      </div>

      {/* Button Styles Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-subtle space-y-5">
        <div className="border-b border-gray-100 dark:border-zinc-800/80 pb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Shapes className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Button Style
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Choose the geometric treatment for links and actions across your profile.
          </p>
        </div>

        {/* Button Styles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BUTTON_STYLES.map((style) => {
            const isSelected = buttonStyle === style.id;
            const isOutline = style.id === "outline";

            return (
              <button
                key={style.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChangeButtonStyle(style.id)}
                className={`relative flex flex-col p-4 rounded-xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
                  isSelected
                    ? "border-brand-500 bg-brand-50/40 dark:bg-brand-950/20 shadow-subtle"
                    : "border-gray-200/80 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                }`}
              >
                {/* Active check pill */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}

                {/* Simulated Link Button Preview */}
                <div className="mb-3 w-full py-2 px-1 flex items-center justify-center bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                  <div
                    className={`w-36 h-8 text-xs font-semibold flex items-center justify-center transition-all ${style.previewClass}`}
                    style={
                      isOutline
                        ? {
                            borderColor: primaryColor,
                            color: primaryColor,
                            backgroundColor: "transparent",
                          }
                        : {
                            backgroundColor: primaryColor,
                            color: "#ffffff",
                          }
                    }
                  >
                    Preview Link
                  </div>
                </div>

                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {style.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                  {style.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
