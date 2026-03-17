"use client";

import { useEffect, useState, useCallback } from "react";
import { UserProfile } from "@/lib/types";
import { Globe, ArrowRight, MoreVertical, Smartphone, Monitor, RefreshCw } from "lucide-react";

import ProfileHeader from "../profile/ProfileHeader";
import SocialLinks from "../profile/SocialLinks";
import BusinessSection from "../profile/BusinessSection";
import PaymentSection from "../profile/PaymentSection";

import { usePreview } from "./PreviewContext";

export default function MobilePreview() {
  const { previewUser: user } = usePreview();
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");
  const [refreshKey, setRefreshKey] = useState(0);

  const forceRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  if (!user) {
    return (
      <div className="w-full max-w-[320px] mx-auto h-[650px] rounded-[3rem] border-[8px] border-zinc-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 flex flex-col shadow-2xl overflow-hidden animate-pulse relative z-10">
        <div className="w-full h-full flex items-center justify-center text-gray-400">Loading preview...</div>
      </div>
    );
  }

  const themePrimary = user.theme?.primaryColor || "#6366f1";
  
  // Provide defaults for the theme object so the components don't crash
  const theme = user.theme || {
    primaryColor: "#6366f1",
    backgroundColor: "light",
    fontFamily: "Inter",
    buttonStyle: "pill"
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative z-10 px-4">
      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center bg-white dark:bg-zinc-900 p-1 rounded-full border border-gray-200 dark:border-zinc-800 shadow-sm">
          <button
            onClick={() => setPreviewMode("mobile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              previewMode === "mobile" 
                ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Smartphone className="w-4 h-4" /> Mobile
          </button>
          <button
            onClick={() => setPreviewMode("desktop")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              previewMode === "desktop" 
                ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Monitor className="w-4 h-4" /> Desktop
          </button>
        </div>
        <button 
          onClick={forceRefresh}
          className="p-2.5 rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
          title="Refresh Preview"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Frame */}
      <div 
        key={refreshKey}
        className={`relative overflow-hidden flex flex-col transition-all duration-500 ${
          previewMode === "mobile"
            ? "w-full max-w-[320px] h-[650px] rounded-[3rem] border-[8px] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-2xl ring-1 ring-gray-900/5 dark:ring-white/10"
            : "w-full max-w-4xl h-[700px] rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-background shadow-xl"
        }`}
      >
        
        {/* Notch (Mobile Only) */}
        {previewMode === "mobile" && (
          <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
            <div className="w-32 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-b-3xl"></div>
          </div>
        )}

        {/* Scrollable Content (simulating the profile container) */}
        <div 
          className="flex-1 overflow-y-auto no-scrollbar pb-10 flex flex-col relative bg-background items-center w-full"
          style={{ "--user-primary": themePrimary } as React.CSSProperties}
        >
            {/* Animated Background Blobs but smaller for the preview */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 -left-10 w-40 h-40 rounded-full blur-2xl opacity-20" style={{ backgroundColor: 'var(--user-primary)' }}></div>
                <div className="absolute bottom-20 -right-10 w-40 h-40 rounded-full blur-2xl opacity-20" style={{ backgroundColor: 'var(--user-primary)' }}></div>
            </div>

            <div className="relative z-10 w-full flex flex-col items-center pt-8">
                <ProfileHeader
                    displayName={user.displayName}
                    username={user.username}
                    bio={user.bio}
                    avatarUrl={user.avatarUrl}
                    bannerUrl={user.bannerUrl}
                />

                <SocialLinks links={user.socialLinks} theme={theme} />

                <BusinessSection links={user.businessLinks} theme={theme} />

                <PaymentSection payments={user.payments} theme={theme} />
                
                {(!user.businessLinks?.length && !user.socialLinks?.length && !user.payments?.length) && (
                    <div className="mt-8 px-6 w-full">
                        <div className="p-4 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl text-center text-sm text-gray-400">
                            Add links in your dashboard
                        </div>
                    </div>
                )}
                
                <div className="mt-12 mb-4 text-center">
                    <p className="text-[10px] text-gray-400">
                        Powered by <span className="font-bold text-gray-800 dark:text-gray-200">Linkle</span>
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
