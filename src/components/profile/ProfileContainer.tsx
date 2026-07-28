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
import { QrCode, X, Share2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface ProfileContainerProps {
    user: UserProfile;
}

export default function ProfileContainer({ user }: ProfileContainerProps) {
    const [showQR, setShowQR] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/p/${user.username}` : `https://linkle.app/p/${user.username}`;

    useEffect(() => {
        if (typeof window === "undefined" || window.location.pathname.startsWith("/dashboard")) return;
        
        let visitorId = localStorage.getItem("linkle_visitor_id");
        if (!visitorId) {
            visitorId = "vis_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem("linkle_visitor_id", visitorId);
        }
        
        fetch("/api/analytics/view", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: user.username,
                referrer: document.referrer || "Direct",
                visitorId,
            }),
        }).catch((err) => console.error("Error logging view:", err));
    }, [user.username]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${user.displayName} - Linkle Profile`,
                    text: user.bio,
                    url: profileUrl,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(profileUrl);
            setShowShare(true);
            setTimeout(() => setShowShare(false), 2000);
        }
    };

    const handleContainerClick = async (e: React.MouseEvent<HTMLDivElement>) => {
        const target = (e.target as HTMLElement).closest('[data-track-id]');
        if (!target) return;
        
        const linkId = target.getAttribute('data-track-id');
        const linkType = target.getAttribute('data-track-type');
        const linkTitle = target.getAttribute('data-track-title') || '';
        const url = target.getAttribute('data-track-url') || '';
        
        if (linkId && linkType) {
            try {
                await fetch('/api/analytics/click', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        linkId,
                        linkType,
                        linkTitle,
                        url,
                        referrer: document.referrer || "Direct"
                    }),
                    keepalive: true
                });
            } catch (err) {
                console.error('Failed to track click:', err);
            }
        }
    };

    return (
        <div 
            onClick={handleContainerClick}
            className="min-h-screen pb-20 bg-background flex flex-col items-center relative"
            style={{ 
                '--user-primary': user.theme.primaryColor || '#6366f1',
                fontFamily: user.theme.fontFamily || 'Inter'
            } as React.CSSProperties}
        >
            {/* Dynamic Google Font Loader */}
            {user.theme.fontFamily && (
                <style dangerouslySetInnerHTML={{ __html: `
                    @import url('https://fonts.googleapis.com/css2?family=${user.theme.fontFamily.replace(/\s+/g, '+')}:wght@400;500;600;700;800;900&display=swap');
                `}} />
            )}
            {/* Animated Background Blobs */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full blur-3xl animate-float opacity-20" style={{ backgroundColor: 'var(--user-primary)' }}></div>
                <div className="absolute bottom-1/4 -right-20 w-72 h-72 rounded-full blur-3xl animate-float opacity-20" style={{ animationDelay: '1.5s', backgroundColor: 'var(--user-primary)' }}></div>
            </div>

            {/* Floating Action Buttons */}
            <div className="fixed top-4 right-4 z-50 flex gap-2">
                <ThemeToggle />

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShare}
                    className="p-3 glass dark:glass-dark rounded-full shadow-lg hover:shadow-glow transition-all"
                >
                    <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowQR(true)}
                    className="p-3 glass dark:glass-dark rounded-full shadow-lg hover:shadow-glow transition-all"
                >
                    <QrCode className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </motion.button>
            </div>

            {/* Share Notification */}
            <AnimatePresence>
                {showShare && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-20 right-4 z-50 px-4 py-2 glass dark:glass-dark rounded-full shadow-lg text-sm font-medium"
                    >
                        Link copied to clipboard!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* QR Code Modal */}
            <AnimatePresence>
                {showQR && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative"
                        >
                            <button
                                onClick={() => setShowQR(false)}
                                className="absolute -top-12 right-0 p-2 text-white hover:bg-white/20 rounded-full transition"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            {user.avatarUrl ? (
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500/40 shrink-0">
                                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 font-bold text-2xl uppercase border-2 border-purple-500/40 shrink-0">
                                    {(() => {
                                        const parts = user.displayName.trim().split(/\s+/);
                                        if (parts.length === 1) {
                                            return parts[0][0].toUpperCase();
                                        }
                                        return (parts[0][0] + parts[1][0]).toUpperCase();
                                    })()}
                                </div>
                            )}
                            <QRGenerator url={profileUrl} />
                        </motion.div>
                        <div className="absolute inset-0 -z-10" onClick={() => setShowQR(false)} />
                    </motion.div>
                )}
            </AnimatePresence>

            <ProfileHeader
                displayName={user.displayName}
                username={user.username}
                bio={user.bio}
                avatarUrl={user.avatarUrl}
                bannerUrl={user.bannerUrl}
            />

            <ContactSection actions={user.contactActions} theme={user.theme} />

            <SocialLinks links={user.socialLinks} theme={user.theme} />

            <BusinessSection links={user.businessLinks} theme={user.theme} />

            <PaymentSection payments={user.payments} theme={user.theme} />

            <EmailCaptureSection
                username={user.username}
                enabled={user.emailCaptureEnabled || false}
                title={user.emailCaptureTitle || "Subscribe to my newsletter"}
                placeholder={user.emailCapturePlaceholder || "Enter your email"}
                theme={user.theme}
            />

            <LocationSection location={user.location} theme={user.theme} />

            <div className="mt-12 text-center flex items-center justify-center">
                <Link href="/" className="inline-flex items-center gap-2 group opacity-80 hover:opacity-100 transition-opacity">
                    <Image src="/logo.png" alt="Linkle Logo" width={18} height={18} className="object-contain" />
                    <span className="text-sm font-medium text-gray-400">
                        Powered by <span className="font-bold gradient-text">Linkle</span>
                    </span>
                </Link>
            </div>
        </div>
    );
}
