"use client";

import React from "react";
import ImageUpload from "@/components/ui/ImageUpload";
import { User, Sparkles } from "lucide-react";

interface ProfileSectionProps {
  displayName: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  onChange: (field: string, value: string) => void;
}

export function ProfileSection({
  displayName,
  bio,
  avatarUrl,
  bannerUrl,
  onChange,
}: ProfileSectionProps) {
  const maxDisplayChars = 50;
  const maxBioChars = 160;

  return (
    <div className="space-y-6">
      {/* Identity Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-subtle space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 pb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Profile Identity
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              The primary name and introduction shown at the top of your Linkle page.
            </p>
          </div>
        </div>

        {/* Display Name Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="displayName"
              className="text-xs font-semibold text-gray-700 dark:text-gray-300"
            >
              Display Name
            </label>
            <span
              className={`text-[11px] tabular-nums ${
                displayName.length > maxDisplayChars
                  ? "text-red-500 font-semibold"
                  : "text-gray-400 dark:text-zinc-500"
              }`}
            >
              {displayName.length}/{maxDisplayChars}
            </span>
          </div>
          <input
            id="displayName"
            name="displayName"
            type="text"
            maxLength={maxDisplayChars}
            value={displayName}
            onChange={(e) => onChange("displayName", e.target.value)}
            placeholder="e.g. Alex Rivera"
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Bio Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="bio"
              className="text-xs font-semibold text-gray-700 dark:text-gray-300"
            >
              Bio / Subtitle
            </label>
            <span
              className={`text-[11px] tabular-nums ${
                bio.length > maxBioChars
                  ? "text-red-500 font-semibold"
                  : "text-gray-400 dark:text-zinc-500"
              }`}
            >
              {bio.length}/{maxBioChars}
            </span>
          </div>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            maxLength={maxBioChars}
            value={bio}
            onChange={(e) => onChange("bio", e.target.value)}
            placeholder="Tell visitors who you are, what you build, or how to contact you..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all resize-none"
          />
        </div>
      </div>

      {/* Visual Media Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-subtle space-y-6">
        <div className="border-b border-gray-100 dark:border-zinc-800/80 pb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Profile Media
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Avatar picture and header cover banner. Uploaded assets are automatically compressed.
          </p>
        </div>

        {/* Avatar Upload */}
        <div className="space-y-3">
          <ImageUpload
            label="Avatar Photo"
            helperText="Square image recommended. Automatically compressed before upload."
            value={avatarUrl}
            onChange={(url) => onChange("avatarUrl", url)}
            aspectRatio="square"
            folder="avatars"
            maxWidth={800}
            maxHeight={800}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-zinc-800/80 pt-4">
          <ImageUpload
            label="Header Banner (Optional)"
            helperText="Recommended dimension: 1920 × 480 px. Displays behind your avatar at the top of your page."
            value={bannerUrl}
            onChange={(url) => onChange("bannerUrl", url)}
            aspectRatio="banner"
            folder="banners"
            maxWidth={1920}
            maxHeight={1080}
          />
        </div>
      </div>
    </div>
  );
}
