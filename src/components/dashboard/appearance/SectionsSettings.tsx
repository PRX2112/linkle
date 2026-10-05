"use client";

import React, { useState } from "react";
import {
  MapPin,
  Mail,
  Navigation,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Send,
} from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";

interface SectionsSettingsProps {
  locationAddress: string;
  locationGoogleMapsEmbedUrl: string;
  locationIsVisible: boolean;
  locationShowDirectionsBtn: boolean;
  emailCaptureEnabled: boolean;
  emailCaptureTitle: string;
  emailCapturePlaceholder: string;
  primaryColor: string;
  buttonStyle: string;
  onChange: (field: string, value: any) => void;
}

export function SectionsSettings({
  locationAddress,
  locationGoogleMapsEmbedUrl,
  locationIsVisible,
  locationShowDirectionsBtn,
  emailCaptureEnabled,
  emailCaptureTitle,
  emailCapturePlaceholder,
  primaryColor,
  buttonStyle,
  onChange,
}: SectionsSettingsProps) {
  const [showEmbedGuide, setShowEmbedGuide] = useState(false);

  const buttonRadiusClass =
    buttonStyle === "pill"
      ? "rounded-full"
      : buttonStyle === "square"
      ? "rounded-sm"
      : "rounded-lg";

  return (
    <div className="space-y-6">
      {/* Location Section Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-subtle space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 pb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Location & Map
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Display your studio, workspace, or city with an interactive map embed.
            </p>
          </div>

          <Toggle
            checked={locationIsVisible}
            onChange={(val) => onChange("locationIsVisible", val)}
            label=""
            aria-label="Toggle location visibility"
          />
        </div>

        {locationIsVisible ? (
          <div className="space-y-4 pt-1">
            {/* Address Input */}
            <div>
              <label
                htmlFor="locationAddress"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Physical Address or City
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" />
                <input
                  id="locationAddress"
                  type="text"
                  value={locationAddress}
                  onChange={(e) => onChange("locationAddress", e.target.value)}
                  placeholder="e.g. 742 Evergreen Terrace, Springfield, OR"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Google Maps Embed URL */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="locationGoogleMapsEmbedUrl"
                  className="text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Google Maps Embed URL (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => setShowEmbedGuide(!showEmbedGuide)}
                  className="inline-flex items-center gap-1 text-[11px] text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  How to get embed URL
                  {showEmbedGuide ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </div>

              <input
                id="locationGoogleMapsEmbedUrl"
                type="url"
                value={locationGoogleMapsEmbedUrl}
                onChange={(e) => onChange("locationGoogleMapsEmbedUrl", e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />

              {/* Guidance Accordion */}
              {showEmbedGuide && (
                <div className="mt-2.5 p-3.5 rounded-lg bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-xs text-gray-600 dark:text-zinc-300 space-y-1.5">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    How to get your Google Maps embed URL:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-500 dark:text-zinc-400">
                    <li>Open Google Maps and search for your venue or city.</li>
                    <li>
                      Click the <strong className="text-gray-700 dark:text-zinc-200">Share</strong> button, then select the <strong className="text-gray-700 dark:text-zinc-200">Embed a map</strong> tab.
                    </li>
                    <li>
                      Copy only the link inside the <code className="bg-white dark:bg-zinc-900 px-1 py-0.5 rounded text-[11px]">src=&quot;...&quot;</code> attribute (starts with <code className="text-brand-600 dark:text-brand-400">https://www.google.com/maps/embed?pb=</code>).
                    </li>
                  </ol>
                </div>
              )}
            </div>

            {/* Directions Toggle */}
            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/80">
              <Toggle
                checked={locationShowDirectionsBtn}
                onChange={(val) => onChange("locationShowDirectionsBtn", val)}
                label="Show 'Get Directions' button"
                description="Allows visitors to open Google Maps navigation directly with one click."
                size="sm"
              />
            </div>
          </div>
        ) : (
          <div className="py-2 text-center text-xs text-gray-400 dark:text-zinc-500">
            Location is currently hidden from your public profile.
          </div>
        )}
      </div>

      {/* Email Capture Newsletter Section Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-subtle space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 pb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Email Capture Newsletter
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Collect email subscribers directly on your public profile.
            </p>
          </div>

          <Toggle
            checked={emailCaptureEnabled}
            onChange={(val) => onChange("emailCaptureEnabled", val)}
            label=""
            aria-label="Toggle email capture"
          />
        </div>

        {emailCaptureEnabled ? (
          <div className="space-y-4 pt-1">
            {/* Title Input */}
            <div>
              <label
                htmlFor="emailCaptureTitle"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Card Title
              </label>
              <input
                id="emailCaptureTitle"
                type="text"
                maxLength={100}
                value={emailCaptureTitle}
                onChange={(e) => onChange("emailCaptureTitle", e.target.value)}
                placeholder="Subscribe to my newsletter"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>

            {/* Placeholder Input */}
            <div>
              <label
                htmlFor="emailCapturePlaceholder"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Input Field Placeholder
              </label>
              <input
                id="emailCapturePlaceholder"
                type="text"
                maxLength={50}
                value={emailCapturePlaceholder}
                onChange={(e) => onChange("emailCapturePlaceholder", e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>

            {/* Mini Visual Preview of the Capture Widget */}
            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/80">
              <p className="text-[11px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                Card Preview on Profile
              </p>
              <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-950/40 space-y-2.5">
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 text-center">
                  {emailCaptureTitle || "Subscribe to my newsletter"}
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-gray-400">
                    {emailCapturePlaceholder || "Enter your email"}
                  </div>
                  <div
                    className={`px-3 py-1.5 text-xs font-medium text-white flex items-center gap-1 ${buttonRadiusClass}`}
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Send className="w-3 h-3" />
                    <span>Join</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-2 text-center text-xs text-gray-400 dark:text-zinc-500">
            Email capture is currently disabled. Toggle on to start gathering subscriber emails.
          </div>
        )}
      </div>
    </div>
  );
}
