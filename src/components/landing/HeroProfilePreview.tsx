"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  QrCode,
  Smartphone,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Download,
  Share2,
} from "lucide-react";

export default function HeroProfilePreview() {
  const [activeTab, setActiveTab] = useState<"profile" | "upi" | "qr">("profile");
  const [copied, setCopied] = useState(false);

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText("alex.rivera@okaxis");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[380px] select-none">
      {/* Ambient Backdrop Ring (Subtle & Restrained) */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-500/20 via-indigo-500/10 to-brand-600/20 rounded-[44px] blur-xl opacity-75 dark:opacity-40 -z-10" />

      {/* Realistic Mobile Device Frame */}
      <div className="relative rounded-[38px] border-4 border-gray-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden text-gray-900 dark:text-zinc-100 flex flex-col transition-all duration-300">
        {/* Phone Speaker & Dynamic Island Notch */}
        <div className="pt-3 pb-2 px-6 flex items-center justify-between text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800/60">
          <span>9:41</span>
          <div className="w-18 h-4 bg-gray-900 dark:bg-zinc-800 rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-zinc-700 rounded-full" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-5 h-2.5 border border-current rounded-xs flex items-center p-0.5">
              <div className="w-3 h-1.5 bg-current rounded-xs" />
            </div>
          </div>
        </div>

        {/* View Switcher Chips (Profile / UPI Pay / QR) */}
        <div className="p-2 bg-gray-100/70 dark:bg-zinc-900/70 border-b border-gray-200/60 dark:border-zinc-800 flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTab === "profile"
                ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upi")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === "upi"
                ? "bg-brand-600 text-white shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <span>Linkle Pay</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("qr")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === "qr"
                ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <QrCode className="w-3 h-3" />
            <span>QR</span>
          </button>
        </div>

        {/* Body Container */}
        <div className="p-4 sm:p-5 max-h-[530px] overflow-y-auto">
          {activeTab === "profile" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Cover Banner & Avatar */}
              <div className="relative">
                <div className="h-20 w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 overflow-hidden relative shadow-inner">
                  <div className="absolute inset-0 bg-black/10" />
                </div>
                <div className="flex justify-center -mt-9">
                  <div className="relative w-18 h-18 rounded-full border-3 border-white dark:border-zinc-950 bg-brand-600 flex items-center justify-center text-white font-bold text-xl shadow-md overflow-hidden">
                    <span className="tracking-tight">AR</span>
                  </div>
                </div>
              </div>

              {/* Identity Header */}
              <div className="text-center space-y-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
                  Alex Rivera
                </h3>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                  Design Technologist & Founder
                </p>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug px-2">
                  Building open tools for creators. Writing about UI architectures and indie products.
                </p>
                <p className="text-[10px] font-mono text-gray-600 dark:text-gray-400 font-medium">
                  @alexrivera
                </p>
              </div>

              {/* Social Icons Bar */}
              <div className="flex items-center justify-center gap-2 pt-1">
                {["X", "GitHub", "YouTube", "LinkedIn", "Mail"].map((social) => (
                  <span
                    key={social}
                    className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 flex items-center justify-center text-[10px] font-bold hover:scale-105 transition-transform"
                  >
                    {social[0]}
                  </span>
                ))}
              </div>

              {/* Featured Primary Link */}
              <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/40 border-2 border-brand-500/40 hover:border-brand-500 transition-colors shadow-xs group cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-brand-500 text-white mb-1">
                      Featured
                    </span>
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <span>Interactive UI Systems 2026</span>
                    </h4>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                      Open source design token foundation for React & Tailwind.
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              {/* Standard Custom Link */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors shadow-xs group cursor-pointer">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white">
                      The Indie Builder Podcast Ep. 42
                    </h4>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                      Scaling to your first $10K MRR without venture capital.
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white transition-colors" />
                </div>
              </div>

              {/* Linkle Pay UPI Teaser Card */}
              <div
                onClick={() => setActiveTab("upi")}
                className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-brand-500/10 border border-emerald-500/30 hover:border-emerald-500/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      ₹
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        Linkle Pay UPI
                      </p>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400">
                        alex.rivera@okaxis • Zero fee
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Pay →
                  </span>
                </div>
              </div>

              {/* Contact Button */}
              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs hover:opacity-90 transition-opacity"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Save Contact to Phone</span>
              </button>
            </div>
          )}

          {activeTab === "upi" && (
            <div className="space-y-4 animate-in fade-in duration-200 text-center py-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center font-bold text-lg">
                ₹
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Instant Direct Payment
                </span>
                <h4 className="font-bold text-base text-gray-900 dark:text-white">
                  Pay Alex Rivera
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  UPI ID: <span className="font-mono font-medium text-gray-900 dark:text-gray-200">alex.rivera@okaxis</span>
                </p>
              </div>

              {/* QR Mockup */}
              <div className="mx-auto w-36 h-36 bg-white p-2 rounded-2xl border-2 border-gray-200 shadow-md flex flex-col items-center justify-center">
                <QrCode className="w-28 h-28 text-gray-900" />
              </div>
              <p className="text-[10px] text-gray-600 dark:text-gray-400">
                Scan with Google Pay, PhonePe, Paytm, or BHIM
              </p>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Pay via UPI App</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="w-full py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied UPI ID!" : "Copy UPI ID"}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "qr" && (
            <div className="space-y-4 animate-in fade-in duration-200 text-center py-2">
              <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Profile QR Code
                </span>
                <h4 className="font-bold text-base text-gray-900 dark:text-white">
                  linkle.app/p/alexrivera
                </h4>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                  Point any phone camera to view this profile instantly.
                </p>
              </div>

              {/* Profile QR Mockup */}
              <div className="mx-auto w-40 h-40 bg-white p-3 rounded-2xl border-2 border-brand-500/30 shadow-md flex flex-col items-center justify-center">
                <QrCode className="w-32 h-32 text-gray-900" />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  className="flex-1 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Attribution Tag */}
        <div className="py-2.5 bg-gray-50 dark:bg-zinc-900/80 border-t border-gray-100 dark:border-zinc-800 text-center text-[10px] text-gray-600 dark:text-gray-400 font-medium">
          Powered by <span className="font-bold text-gray-800 dark:text-gray-200">Linkle</span>
        </div>
      </div>
    </div>
  );
}
