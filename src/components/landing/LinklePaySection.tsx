"use client";

import { useState } from "react";
import { QrCode, Smartphone, Check, Copy, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export default function LinklePaySection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText("creator@upi");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="payments" className="py-16 sm:py-24 bg-gray-50/70 dark:bg-zinc-900/40 border-t border-gray-200/80 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Messaging & Benefits */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Zap className="w-3.5 h-3.5" />
              <span>Linkle Pay UPI</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Get paid directly from your profile with zero fees.
            </h2>

            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Accept tips, project deposits, and payments without handing over 5% to 15% in platform commissions.
              Visitors can launch their native UPI app in one tap or scan your profile&apos;s dynamic QR code.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    One-Tap Mobile App Deep Link
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Mobile visitors tap &quot;Pay via UPI App&quot; to directly trigger Google Pay, PhonePe, Paytm, or BHIM.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    High-Contrast Dynamic QR
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Desktop visitors scan your high-resolution QR directly off their screen using any UPI scanner.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    100% Direct & Peer-to-Peer
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Funds go directly from customer to your bank. Linkle never holds your funds or charges middleman fees.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                <span>Set up Linkle Pay on your profile</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Visual UPI Modal Representation */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-sm p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 shadow-xl text-center space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    ₹
                  </div>
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    Linkle Pay
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  0% Commission
                </span>
              </div>

              <div>
                <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                  Pay Directly
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Alex Rivera
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  alex.rivera@okaxis
                </p>
              </div>

              {/* QR Code Container */}
              <div className="mx-auto w-44 h-44 bg-white p-3 rounded-2xl border-2 border-gray-200 shadow-sm flex flex-col items-center justify-center">
                <QrCode className="w-36 h-36 text-gray-900" />
              </div>

              <p className="text-[11px] text-gray-500">
                Scan with Google Pay, PhonePe, Paytm, or BHIM
              </p>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Pay via UPI App</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied UPI ID" : "Copy UPI ID"}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Peer-to-peer payment initiation • No intermediary wallet</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
