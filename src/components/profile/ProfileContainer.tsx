"use client";

import Image from "next/image";
import Link from "next/link";
import { UserProfile } from "@/lib/types";
import ProfileHeader from "./ProfileHeader";
import SocialLinks from "./SocialLinks";
import BusinessSection from "./BusinessSection";
import LocationSection from "./LocationSection";
import PaymentSection from "./PaymentSection";
import ContactSection from "./ContactSection";
import EmailCaptureSection from "./EmailCaptureSection";
import QRGenerator from "../qr/QRGenerator";
import ThemeToggle from "../ui/ThemeToggle";
import { useState, useEffect } from "react";
import { QrCode, X, Share2, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { tracker } from "@/lib/analytics/tracker";

interface ProfileContainerProps {
    user: UserProfile;
}

export default function ProfileContainer({ user }: ProfileContainerProps) {
    const [showQR, setShowQR] = useState(false);
    const [showShareToast, setShowShareToast] = useState(false);

    const origin = typeof window !== "undefined" ? window.location.origin : "https://linklez.vercel.app";
    const profileUrl = `${origin}/p/${user.username}`;

    // Track profile view on initial page load
    useEffect(() => {
        if (typeof window === "undefined" || window.location.pathname.startsWith("/dashboard")) return;

        let visitorId = localStorage.getItem("linkle_visitor_id");
        if (!visitorId) {
            visitorId = "vis_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem("linkle_visitor_id", visitorId);
        }

        // Track unified profile view event
        tracker.profileView(user.id, user.username);

        fetch("/api/analytics/view", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: user.username,
                referrer: document.referrer || "Direct",
                visitorId,
            }),
        }).catch((err) => console.error("Error logging view:", err));
    }, [user.id, user.username]);

    // Handle Escape key to dismiss QR modal
    useEffect(() => {
        if (!showQR) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowQR(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showQR]);

    const handleShare = async () => {
        const canShare = typeof navigator !== "undefined" && Boolean(navigator.share);
        tracker.profileShare(user.id, canShare ? "native" : "clipboard");

        if (canShare) {
            try {
                await navigator.share({
                    title: `${user.displayName} - Linkle Profile`,
                    text: user.bio,
                    url: profileUrl,
                });
            } catch {
                // User cancelled or unsupported
            }
        } else {
            try {
                await navigator.clipboard.writeText(profileUrl);
                setShowShareToast(true);
                setTimeout(() => setShowShareToast(false), 2000);
            } catch {
                // Fallback
            }
        }
    };

    // Centralized event listener for all clickable blocks
    const handleContainerClick = async (e: React.MouseEvent<HTMLDivElement>) => {
        const target = (e.target as HTMLElement).closest("[data-track-id]");
        if (!target) return;

        const linkId = target.getAttribute("data-track-id");
        const linkType = target.getAttribute("data-track-type");
        const linkTitle = target.getAttribute("data-track-title") || "";
        const url = target.getAttribute("data-track-url") || "";

        if (linkId && linkType) {
            if (linkType === "payment") {
                tracker.paymentClick(user.id, linkId, linkTitle, url);
            } else if (linkType === "contact") {
                const lower = (linkTitle + " " + url).toLowerCase();
                if (lower.includes("cal") || lower.includes("book") || lower.includes("appointment")) {
                    tracker.bookingClick(user.id, linkId, linkTitle, url);
                } else {
                    tracker.contactSave(user.id, linkId, linkTitle);
                }
            } else if (linkType === "cta") {
                tracker.ctaClick(user.id, linkId, linkTitle, url);
            } else {
                tracker.linkClick(user.id, linkId, linkType, linkTitle, url);
            }

            try {
                await fetch("/api/analytics/click", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: user.id,
                        linkId,
                        linkType,
                        linkTitle,
                        url,
                        referrer: document.referrer || "Direct",
                    }),
                    keepalive: true,
                });
            } catch (err) {
                console.error("Failed to track click:", err);
            }
        }
    };

    return (
        <div
            onClick={handleContainerClick}
            className="min-h-screen pb-16 bg-background flex flex-col items-center relative overflow-x-hidden selection:bg-[var(--user-primary)] selection:text-white"
            style={{
                "--user-primary": user.theme?.primaryColor || "#6366f1",
                fontFamily: user.theme?.fontFamily || "Inter",
            } as React.CSSProperties}
        >
            {/* Dynamic Google Font Loader */}
            {user.theme?.fontFamily && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                        @import url('https://fonts.googleapis.com/css2?family=${user.theme.fontFamily.replace(/\s+/g, "+")}:wght@400;500;600;700;800;900&display=swap');
                        @media (prefers-reduced-motion: reduce) {
                            .profile-blob { animation: none !important; }
                        }
                    `
                }} />
            )}

            {/* Subtle Ambient Background Gradients */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none opacity-25 dark:opacity-15">
                <div
                    className="profile-blob absolute top-1/6 -left-20 w-80 h-80 rounded-full blur-3xl"
                    style={{ backgroundColor: "var(--user-primary)" }}
                />
                <div
                    className="profile-blob absolute bottom-1/4 -right-20 w-80 h-80 rounded-full blur-3xl"
                    style={{ backgroundColor: "var(--user-primary)" }}
                />
            </div>

            {/* Floating Utility Controls (Theme, Share, QR) */}
            <div className="fixed top-4 right-4 z-40 flex items-center gap-2 pt-safe pr-safe">
                <ThemeToggle />

                <button
                    type="button"
                    onClick={handleShare}
                    className="min-w-[40px] min-h-[40px] p-2.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200/80 dark:border-zinc-800 text-gray-700 dark:text-gray-200 shadow-xs hover:bg-white dark:hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center shrink-0"
                    title="Share profile"
                    aria-label="Share profile"
                >
                    <Share2 className="w-4 h-4" />
                </button>

                <button
                    type="button"
                    onClick={() => {
                        tracker.qrView(user.id, "profile");
                        setShowQR(true);
                    }}
                    className="min-w-[40px] min-h-[40px] p-2.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200/80 dark:border-zinc-800 text-gray-700 dark:text-gray-200 shadow-xs hover:bg-white dark:hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center shrink-0"
                    title="View Profile QR Code"
                    aria-label="View Profile QR Code"
                >
                    <QrCode className="w-4 h-4" />
                </button>
            </div>

            {/* Share Success Toast */}
            <AnimatePresence>
                {showShareToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        className="fixed top-16 right-4 z-50 px-3.5 py-1.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold shadow-lg flex items-center gap-1.5"
                    >
                        <Check className="w-3.5 h-3.5 text-green-400 dark:text-green-600" />
                        <span>Link copied to clipboard</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Profile QR Code Modal */}
            <AnimatePresence>
                {showQR && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                        <div className="absolute inset-0" onClick={() => setShowQR(false)} />
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-label="Profile QR Code"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="relative z-10 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-zinc-800 max-w-xs w-full max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto text-center space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--user-primary)]">
                                    Profile QR
                                </span>
                                <button
                                    onClick={() => setShowQR(false)}
                                    className="min-w-[36px] min-h-[36px] p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
                                    aria-label="Close QR dialog"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs inline-block">
                                <QRGenerator url={profileUrl} userId={user.id} />
                            </div>

                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {user.displayName}
                                </p>
                                <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                    @{user.username}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Main Profile Column */}
            <main className="w-full max-w-lg flex flex-col items-center">
                {/* 1. Profile Header (Avatar, Banner, Display Name, Bio, Username) */}
                <ProfileHeader
                    displayName={user.displayName}
                    username={user.username}
                    bio={user.bio}
                    avatarUrl={user.avatarUrl}
                    bannerUrl={user.bannerUrl}
                />

                {/* 2. Contact Actions (Save Contact, Bookings, Resume) */}
                <ContactSection
                    actions={user.contactActions}
                    theme={user.theme}
                    displayName={user.displayName}
                    username={user.username}
                />

                {/* 3. Social Media Icons */}
                <SocialLinks
                    links={user.socialLinks}
                    theme={user.theme}
                />

                {/* 4. Business & Custom Links (Featured + Regular) */}
                <BusinessSection
                    links={user.businessLinks}
                    theme={user.theme}
                />

                {/* 5. Payments (Linkle Pay UPI + External) */}
                <PaymentSection
                    payments={user.payments}
                    theme={user.theme}
                    displayName={user.displayName}
                    username={user.username}
                    userId={user.id}
                />

                {/* 6. Email Capture Lead Generation */}
                <EmailCaptureSection
                    username={user.username}
                    enabled={user.emailCaptureEnabled || false}
                    title={user.emailCaptureTitle || "Subscribe to my newsletter"}
                    placeholder={user.emailCapturePlaceholder || "Enter your email"}
                    theme={user.theme}
                />

                {/* 7. Location & Maps */}
                <LocationSection
                    location={user.location}
                    theme={user.theme}
                />
            </main>

            {/* 8. Linkle Branding Footer */}
            <footer className="mt-12 text-center flex items-center justify-center">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xs border border-gray-200/60 dark:border-zinc-800 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <Image
                        src="/logo.png"
                        alt="Linkle"
                        width={14}
                        height={14}
                        className="object-contain opacity-80"
                    />
                    <span>Powered by <strong className="text-gray-800 dark:text-gray-200">Linkle</strong></span>
                </Link>
            </footer>
        </div>
    );
}
