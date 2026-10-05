"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Smartphone, Monitor, RefreshCw } from "lucide-react";

import ProfileHeader from "../profile/ProfileHeader";
import SocialLinks from "../profile/SocialLinks";
import BusinessSection from "../profile/BusinessSection";
import PaymentSection from "../profile/PaymentSection";
import ContactSection from "../profile/ContactSection";
import EmailCaptureSection from "../profile/EmailCaptureSection";
import LocationSection from "../profile/LocationSection";

import { usePreview } from "./PreviewContext";

export default function MobilePreview() {
  const { previewUser: user } = usePreview();
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");
  const [refreshKey, setRefreshKey] = useState(0);

  const forceRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  if (!user) {
    return (
      <div className="w-full max-w-[320px] mx-auto h-[640px] rounded-[2.5rem] border-[6px] border-zinc-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 flex flex-col shadow-card overflow-hidden animate-pulse relative z-10">
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium">
          Loading live preview...
        </div>
      </div>
    );
  }

  const rawUser = user as any;
  const themePrimary =
    rawUser.themePrimaryColor || user.theme?.primaryColor || "#6366f1";

  const theme = {
    primaryColor: themePrimary,
    backgroundColor:
      rawUser.themeBackgroundColor || user.theme?.backgroundColor || "light",
    fontFamily: rawUser.themeFontFamily || user.theme?.fontFamily || "Inter",
    buttonStyle: rawUser.themeButtonStyle || user.theme?.buttonStyle || "pill",
  };

  return (
    <div className="flex flex-col items-center justify-start h-full w-full relative z-10 py-6 px-2">
      {/* Dynamic Google Font Loader */}
      {theme.fontFamily && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @import url('https://fonts.googleapis.com/css2?family=${theme.fontFamily.replace(
            /\s+/g,
            "+"
          )}:wght@400;500;600;700;800;900&display=swap');
        `,
          }}
        />
      )}

      {/* Preview Header & Controls */}
      <div className="w-full max-w-[320px] flex items-center justify-between mb-4 px-1">
        {/* Live Preview Label */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-gray-500 dark:text-zinc-400 uppercase select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Preview</span>
        </div>

        {/* Device Switcher & Refresh */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-gray-200/80 dark:border-zinc-700/80">
            <button
              type="button"
              onClick={() => setPreviewMode("mobile")}
              aria-label="Mobile preview mode"
              className={`p-1 rounded-md transition-colors ${
                previewMode === "mobile"
                  ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 shadow-subtle"
                  : "text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("desktop")}
              aria-label="Desktop preview mode"
              className={`p-1 rounded-md transition-colors ${
                previewMode === "desktop"
                  ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 shadow-subtle"
                  : "text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={forceRefresh}
            className="p-1 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700/80 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
            title="Refresh preview"
            aria-label="Refresh live preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Device Frame */}
      <div
        key={refreshKey}
        className={`relative overflow-hidden flex flex-col transition-all duration-300 ${
          previewMode === "mobile"
            ? "w-[310px] sm:w-[320px] max-w-[calc(100vw-2.5rem)] h-[580px] sm:h-[640px] rounded-[2.5rem] border-[6px] border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-card ring-1 ring-black/5 dark:ring-white/5"
            : "w-full max-w-[420px] h-[580px] sm:h-[640px] rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-card"
        }`}
      >
        {/* Notch (Mobile Only) */}
        {previewMode === "mobile" && (
          <div className="absolute top-0 inset-x-0 h-5 flex justify-center z-50 pointer-events-none">
            <div className="w-24 h-4 bg-zinc-300 dark:border-zinc-800 dark:bg-zinc-800 rounded-b-2xl" />
          </div>
        )}

        {/* Scrollable Content (simulating the profile container) */}
        <div
          className="flex-1 overflow-y-auto no-scrollbar pb-10 flex flex-col relative bg-background items-center w-full"
          style={
            {
              "--user-primary": themePrimary,
              fontFamily: theme.fontFamily,
            } as React.CSSProperties
          }
        >
          {/* Subtle Accent Glow */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-10 -left-10 w-40 h-40 rounded-full blur-2xl opacity-15"
              style={{ backgroundColor: "var(--user-primary)" }}
            />
            <div
              className="absolute bottom-20 -right-10 w-40 h-40 rounded-full blur-2xl opacity-15"
              style={{ backgroundColor: "var(--user-primary)" }}
            />
          </div>

          <div className="relative z-10 w-full flex flex-col items-center pt-7 px-1">
            <ProfileHeader
              displayName={user.displayName}
              username={user.username}
              bio={user.bio}
              avatarUrl={user.avatarUrl}
              bannerUrl={user.bannerUrl}
            />

            <ContactSection
              actions={user.contactActions || []}
              theme={theme}
              displayName={user.displayName}
              username={user.username}
            />

            <SocialLinks links={user.socialLinks} theme={theme} />

            <BusinessSection links={user.businessLinks} theme={theme} />

            <PaymentSection
              payments={user.payments}
              theme={theme}
              displayName={user.displayName}
              username={user.username}
            />

            <EmailCaptureSection
              username={user.username}
              enabled={user.emailCaptureEnabled || false}
              title={user.emailCaptureTitle || "Subscribe to my newsletter"}
              placeholder={user.emailCapturePlaceholder || "Enter your email"}
              theme={theme}
              isPreview={true}
            />

            <LocationSection
              location={
                user.location || {
                  address: rawUser.locationAddress || "",
                  googleMapsEmbedUrl: rawUser.locationGoogleMapsEmbedUrl || "",
                  showDirectionsBtn: rawUser.locationShowDirectionsBtn !== undefined ? rawUser.locationShowDirectionsBtn : true,
                  isVisible: rawUser.locationIsVisible !== undefined ? rawUser.locationIsVisible : true,
                }
              }
              theme={theme}
            />

            {!user.businessLinks?.length &&
              !user.socialLinks?.length &&
              !user.payments?.length && (
                <div className="mt-8 px-6 w-full">
                  <div className="p-4 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl text-center text-xs text-gray-400">
                    Add links in your dashboard
                  </div>
                </div>
              )}

            <div className="mt-10 mb-4 text-center flex items-center justify-center gap-1.5">
              <Image
                src="/logo.png"
                alt="Linkle Logo"
                width={12}
                height={12}
                className="object-contain"
              />
              <p className="text-[10px] text-gray-400">
                Powered by{" "}
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  Linkle
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
