"use client";

import { useState } from "react";
import Image from "next/image";
import {
  QrCode,
  Share2,
  Check,
  X,
  Sparkles,
  Smartphone,
  Palette,
  Sun,
  Moon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import ProfileHeader from "@/components/profile/ProfileHeader";
import ContactSection from "@/components/profile/ContactSection";
import SocialLinks from "@/components/profile/SocialLinks";
import BusinessSection from "@/components/profile/BusinessSection";
import ProductsSection from "@/components/profile/ProductsSection";
import PaymentSection from "@/components/profile/PaymentSection";
import EmailCaptureSection from "@/components/profile/EmailCaptureSection";
import QRGenerator from "@/components/qr/QRGenerator";
import {
  UserProfile,
  UserTheme,
  SocialLink,
  BusinessLink,
  PaymentOption,
  ContactAction,
  ProductInfo,
} from "@/lib/types";

// Realistic creator demo data matching the actual Linkle schema
const DEMO_SOCIAL_LINKS: SocialLink[] = [
  { id: "s-twitter", platform: "twitter", url: "https://twitter.com", isVisible: true },
  { id: "s-github", platform: "github", url: "https://github.com", isVisible: true },
  { id: "s-youtube", platform: "youtube", url: "https://youtube.com", isVisible: true },
  { id: "s-linkedin", platform: "linkedin", url: "https://linkedin.com", isVisible: true },
  { id: "s-email", platform: "email", url: "mailto:alex@linkle.me", isVisible: true },
];

const DEMO_BUSINESS_LINKS: BusinessLink[] = [
  {
    id: "b-featured",
    title: "Interactive UI Systems 2026",
    url: "https://github.com",
    description: "Open-source token architecture for React & modern Tailwind.",
    isVisible: true,
    featured: true,
  },
  {
    id: "b-podcast",
    title: "The Indie Builder Podcast Ep. 42",
    url: "https://spotify.com",
    description: "Scaling to $10k MRR without venture funding.",
    isVisible: true,
    featured: false,
  },
];

const DEMO_CONTACT_ACTIONS: ContactAction[] = [
  {
    id: "c-vcard",
    type: "vcard",
    label: "Save Contact",
    url: "#",
    isVisible: true,
    featured: true,
  },
  {
    id: "c-booking",
    type: "book_appointment",
    label: "Book 1:1 Call",
    url: "https://cal.com",
    isVisible: true,
  },
];

const DEMO_PRODUCTS: ProductInfo[] = [
  {
    id: "p-design-kit",
    title: "Design System Pro Kit",
    description: "Production-ready Figma & React component library for indie SaaS founders.",
    priceInCents: 1900,
    currency: "usd",
    type: "DIGITAL_FILE",
    isActive: true,
    order: 0,
  },
];

const DEMO_PAYMENTS: PaymentOption[] = [
  {
    id: "pay-upi",
    platform: "upi",
    value: "alex.rivera@okaxis",
    isVisible: true,
    featured: true,
  },
  {
    id: "pay-stripe",
    platform: "stripe",
    value: "https://stripe.com",
    isVisible: true,
  },
];

const COLOR_OPTIONS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Emerald", value: "#10b981" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Amber", value: "#f59e0b" },
];

const BUTTON_STYLES = [
  { id: "pill", label: "Pill" },
  { id: "rounded", label: "Rounded" },
  { id: "outline", label: "Outline" },
  { id: "square", label: "Square" },
] as const;

export default function HeroProfilePreview() {
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [buttonStyle, setButtonStyle] = useState<"pill" | "rounded" | "outline" | "square">("pill");
  const [isDarkPhone, setIsDarkPhone] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const theme: UserTheme = {
    primaryColor,
    backgroundColor: isDarkPhone ? "dark" : "light",
    fontFamily: "Inter",
    buttonStyle,
  };

  const handleShare = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText("https://linklez.vercel.app/p/alexrivera");
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[380px] flex flex-col items-center">
      {/* Ambient Backdrop Aura */}
      <div
        className="absolute -inset-3 rounded-[52px] blur-2xl opacity-60 dark:opacity-40 transition-all duration-500 -z-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${primaryColor}55 0%, transparent 70%)`,
        }}
      />

      {/* Realistic Mobile Device Frame */}
      <div
        className={`relative w-full rounded-[44px] sm:rounded-[48px] border-[7px] sm:border-[8px] border-zinc-900/90 dark:border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden transition-all duration-300 ring-1 ring-black/10 dark:ring-white/10`}
      >
        {/* Phone Top Speaker & Dynamic Island Notch */}
        <div className="pt-3 pb-2 px-6 flex items-center justify-between text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-white/95 dark:bg-zinc-900/95 border-b border-gray-100 dark:border-zinc-800/60 z-30 relative select-none">
          <span className="font-semibold text-gray-800 dark:text-gray-200">9:41</span>
          <div className="w-20 h-4 bg-zinc-900 dark:bg-zinc-950 rounded-full flex items-center justify-center gap-1.5 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-zinc-800" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700/80" />
          </div>
          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <span className="text-[10px] font-bold">5G</span>
            <div className="w-4 h-2.5 border border-current rounded-xs p-0.5 flex items-center">
              <div className="w-2 h-1.5 bg-current rounded-xs" />
            </div>
          </div>
        </div>

        {/* Device Screen Body */}
        <div
          className={`relative h-[560px] sm:h-[620px] overflow-hidden flex flex-col transition-colors duration-200 ${
            isDarkPhone ? "dark bg-zinc-950 text-white" : "bg-white text-gray-900"
          }`}
          style={{
            "--user-primary": primaryColor,
            fontFamily: "Inter, sans-serif",
          } as React.CSSProperties}
        >
          {/* Subtle Ambient Background Gradients inside Device */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-20 dark:opacity-15">
            <div
              className="absolute top-1/8 -left-16 w-60 h-60 rounded-full blur-3xl transition-colors duration-500"
              style={{ backgroundColor: primaryColor }}
            />
            <div
              className="absolute bottom-1/4 -right-16 w-60 h-60 rounded-full blur-3xl transition-colors duration-500"
              style={{ backgroundColor: primaryColor }}
            />
          </div>

          {/* Floating Utility Controls (Theme, Share, QR) */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsDarkPhone(!isDarkPhone)}
              className="w-7 h-7 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200/80 dark:border-zinc-800 text-gray-700 dark:text-gray-200 shadow-xs hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
              title="Toggle preview dark mode"
              aria-label="Toggle preview dark mode"
            >
              {isDarkPhone ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="w-7 h-7 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200/80 dark:border-zinc-800 text-gray-700 dark:text-gray-200 shadow-xs hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
              title="Share profile"
              aria-label="Share profile"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setShowQR(true)}
              className="w-7 h-7 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200/80 dark:border-zinc-800 text-gray-700 dark:text-gray-200 shadow-xs hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
              title="View Profile QR Code"
              aria-label="View Profile QR Code"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Share Toast */}
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-12 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[11px] font-semibold shadow-lg flex items-center gap-1.5 whitespace-nowrap pointer-events-none"
              >
                <Check className="w-3 h-3 text-emerald-400 dark:text-emerald-600" />
                <span>Link copied to clipboard</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* QR Code Modal Overlay */}
          <AnimatePresence>
            {showQR && (
              <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <div className="absolute inset-0" onClick={() => setShowQR(false)} />
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.16 }}
                  className="relative z-10 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-2xl border border-gray-200 dark:border-zinc-800 w-full max-w-[260px] text-center space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--user-primary)]">
                      Profile QR Code
                    </span>
                    <button
                      onClick={() => setShowQR(false)}
                      className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      aria-label="Close QR dialog"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-gray-200 shadow-2xs inline-block">
                    <QRGenerator
                      url="https://linklez.vercel.app/p/alexrivera"
                      size={140}
                      userId="demo-hero-user"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      Alex Rivera
                    </p>
                    <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                      @alexrivera
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Live Scrollable Profile Screen (NO visible desktop scrollbar!) */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-10 flex flex-col items-center w-full">
            {/* 1. Real ProfileHeader */}
            <ProfileHeader
              displayName="Alex Rivera"
              username="alexrivera"
              bio="Design Technologist & Founder ⚡ Building open tools for creators. Writing about UI architectures and indie products."
              avatarUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
              bannerUrl="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
            />

            {/* 2. Real ContactSection */}
            <ContactSection
              actions={DEMO_CONTACT_ACTIONS}
              theme={theme}
              displayName="Alex Rivera"
              username="alexrivera"
            />

            {/* 3. Real SocialLinks */}
            <SocialLinks links={DEMO_SOCIAL_LINKS} theme={theme} />

            {/* 4. Real BusinessSection (Featured & Standard links) */}
            <BusinessSection links={DEMO_BUSINESS_LINKS} theme={theme} />

            {/* 5. Real ProductsSection (Instant Digital Download / Checkout) */}
            <ProductsSection
              products={DEMO_PRODUCTS}
              theme={theme}
              displayName="Alex Rivera"
              username="alexrivera"
              userId="demo-hero-user"
            />

            {/* 6. Real PaymentSection (Linkle Pay UPI modal & external) */}
            <PaymentSection
              payments={DEMO_PAYMENTS}
              theme={theme}
              displayName="Alex Rivera"
              username="alexrivera"
              userId="demo-hero-user"
              plan="starter"
            />

            {/* 7. Real EmailCaptureSection */}
            <EmailCaptureSection
              username="alexrivera"
              enabled={true}
              title="Join 3,500+ creators"
              placeholder="Enter your email"
              theme={theme}
              isPreview={true}
            />

            {/* 8. Real Linkle Footer */}
            <footer className="mt-8 mb-2 text-center flex items-center justify-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xs border border-gray-200/60 dark:border-zinc-800 text-xs font-medium text-gray-500 dark:text-gray-400">
                <Image
                  src="/logo.png"
                  alt="Linkle"
                  width={14}
                  height={14}
                  className="object-contain opacity-80"
                />
                <span>
                  Powered by <strong className="text-gray-800 dark:text-gray-200">Linkle</strong>
                </span>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* Interactive Customizer Toolbar Underneath Device */}
      <div className="mt-4 w-full flex flex-col items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>Live Interactive Preview — Tap links, UPI pay, or customize below</span>
        </div>

        {/* Button Style Pills & Color Swatches */}
        <div className="flex flex-wrap items-center justify-center gap-3 p-1.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200/80 dark:border-zinc-800 shadow-xs">
          {/* Button Style Selector */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800/80 p-0.5 rounded-xl">
            {BUTTON_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setButtonStyle(style.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  buttonStyle === style.id
                    ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-gray-200 dark:bg-zinc-700 hidden sm:block" />

          {/* Color Palette Selector */}
          <div className="flex items-center gap-1.5 px-1">
            {COLOR_OPTIONS.map((col) => (
              <button
                key={col.name}
                type="button"
                onClick={() => setPrimaryColor(col.value)}
                className={`w-5 h-5 rounded-full transition-transform ${
                  primaryColor === col.value
                    ? "scale-125 ring-2 ring-offset-2 ring-gray-900 dark:ring-white ring-offset-white dark:ring-offset-zinc-900"
                    : "hover:scale-110"
                }`}
                style={{ backgroundColor: col.value }}
                title={col.name}
                aria-label={`Select ${col.name} primary theme`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
