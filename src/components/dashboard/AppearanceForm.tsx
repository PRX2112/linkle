"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { usePreview } from "./PreviewContext";
import {
  User as UserIcon,
  Palette,
  Type,
  Layers,
  Check,
  RotateCcw,
  Loader2,
  ExternalLink,
  AlertCircle,
  Eye,
} from "lucide-react";
import { ProfileSection } from "./appearance/ProfileSection";
import { DesignSection } from "./appearance/DesignSection";
import { TypographySection } from "./appearance/TypographySection";
import { SectionsSettings } from "./appearance/SectionsSettings";
import { useToast } from "@/components/ui/Toast";

interface User {
  id: string;
  username?: string | null;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  themePrimaryColor: string;
  themeButtonStyle: string;
  themeFontFamily?: string | null;
  locationAddress?: string | null;
  locationGoogleMapsEmbedUrl?: string | null;
  locationShowDirectionsBtn?: boolean;
  locationIsVisible?: boolean;
  emailCaptureEnabled?: boolean;
  emailCaptureTitle?: string;
  emailCapturePlaceholder?: string;
}

type TabKey = "profile" | "design" | "typography" | "sections";

export default function AppearanceForm({ user }: { user: User }) {
  const initialForm = useMemo(
    () => ({
      displayName: user.displayName ?? "",
      bio: user.bio ?? "",
      avatarUrl: user.avatarUrl ?? "",
      bannerUrl: user.bannerUrl ?? "",
      themePrimaryColor: user.themePrimaryColor ?? "#6366f1",
      themeButtonStyle: user.themeButtonStyle ?? "pill",
      themeFontFamily: user.themeFontFamily ?? "Inter",
      locationAddress: user.locationAddress ?? "",
      locationGoogleMapsEmbedUrl: user.locationGoogleMapsEmbedUrl ?? "",
      locationShowDirectionsBtn: user.locationShowDirectionsBtn ?? true,
      locationIsVisible: user.locationIsVisible ?? true,
      emailCaptureEnabled: user.emailCaptureEnabled ?? false,
      emailCaptureTitle: user.emailCaptureTitle ?? "Subscribe to my newsletter",
      emailCapturePlaceholder: user.emailCapturePlaceholder ?? "Enter your email",
    }),
    [user]
  );

  const [form, setForm] = useState(initialForm);
  const [savedSnapshot, setSavedSnapshot] = useState(initialForm);
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { updatePreviewUser } = usePreview();
  const { toast } = useToast();

  // Determine if form has unsaved modifications
  const hasChanges = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(savedSnapshot);
  }, [form, savedSnapshot]);

  // Synchronize live preview whenever form changes
  useEffect(() => {
    updatePreviewUser(form);
  }, [form, updatePreviewUser]);

  // Guard against accidental tab close or page navigation if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const handleFieldChange = useCallback((field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleDiscard = () => {
    setForm(savedSnapshot);
    setError("");
    toast.info("Unsaved changes discarded");
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save profile changes");
      }

      setSavedSnapshot(form);
      setSuccess(true);
      toast.success("Appearance saved");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      const msg = err.message || "Failed to save appearance settings";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [form, toast]);

  // Keyboard shortcut: Cmd/Ctrl + S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (hasChanges && !saving) {
          handleSave();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasChanges, saving, handleSave]);

  const tabs = [
    { id: "profile" as TabKey, label: "Profile", icon: UserIcon },
    { id: "design" as TabKey, label: "Design", icon: Palette },
    { id: "typography" as TabKey, label: "Typography", icon: Type },
    { id: "sections" as TabKey, label: "Sections", icon: Layers },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Appearance
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Customize how your Linkle profile looks and feels to visitors.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {user.username && (
            <a
              href={`/p/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700/60 transition-colors shadow-subtle"
            >
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              <span>View live</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-subtle ${
              hasChanges
                ? "bg-brand-600 hover:bg-brand-700 text-white"
                : "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : success ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save changes</span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <span className="w-4 h-4 rounded-full bg-emerald-200 dark:bg-emerald-900/60 flex items-center justify-center shrink-0">
            <Check className="w-2.5 h-2.5 text-emerald-700 dark:text-emerald-300 stroke-[3]" />
          </span>
          Profile appearance updated successfully.
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={handleSave}
            className="ml-auto underline font-semibold hover:text-red-950 dark:hover:text-red-200"
          >
            Try again
          </button>
        </div>
      )}

      {/* Segmented Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-zinc-800/70 rounded-xl border border-gray-200/80 dark:border-zinc-800 overflow-x-auto no-scrollbar">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;

          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(id)}
              className={`flex-1 min-w-[90px] flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all select-none ${
                isActive
                  ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 shadow-subtle font-semibold"
                  : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive
                    ? "text-brand-600 dark:text-brand-400"
                    : "text-gray-400 dark:text-zinc-500"
                }`}
              />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div className="mt-6">
        {activeTab === "profile" && (
          <ProfileSection
            displayName={form.displayName}
            bio={form.bio}
            avatarUrl={form.avatarUrl}
            bannerUrl={form.bannerUrl}
            onChange={handleFieldChange}
          />
        )}

        {activeTab === "design" && (
          <DesignSection
            primaryColor={form.themePrimaryColor}
            buttonStyle={form.themeButtonStyle}
            onChangeColor={(col) => handleFieldChange("themePrimaryColor", col)}
            onChangeButtonStyle={(st) => handleFieldChange("themeButtonStyle", st)}
          />
        )}

        {activeTab === "typography" && (
          <TypographySection
            currentFont={form.themeFontFamily}
            onChangeFont={(font) => handleFieldChange("themeFontFamily", font)}
          />
        )}

        {activeTab === "sections" && (
          <SectionsSettings
            locationAddress={form.locationAddress}
            locationGoogleMapsEmbedUrl={form.locationGoogleMapsEmbedUrl}
            locationIsVisible={form.locationIsVisible}
            locationShowDirectionsBtn={form.locationShowDirectionsBtn}
            emailCaptureEnabled={form.emailCaptureEnabled}
            emailCaptureTitle={form.emailCaptureTitle}
            emailCapturePlaceholder={form.emailCapturePlaceholder}
            primaryColor={form.themePrimaryColor}
            buttonStyle={form.themeButtonStyle}
            onChange={handleFieldChange}
          />
        )}
      </div>

      {/* Floating Unsaved Changes Bottom Bar */}
      {hasChanges && (
        <div className="fixed bottom-4 pb-safe inset-x-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 max-w-md mx-auto sm:mx-0 flex items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-900/95 dark:bg-zinc-800/95 text-white backdrop-blur-md shadow-card border border-white/10 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="text-xs font-medium text-gray-200 truncate">
              Unsaved changes
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={saving}
              className="px-2.5 py-1.5 text-xs text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-brand-500 hover:bg-brand-600 text-white shadow-subtle transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
