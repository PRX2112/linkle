"use client";

import React, { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, Download, Share2, Smartphone, ExternalLink, AlertCircle, ShieldCheck } from "lucide-react";
import { generateUpiUri, cleanUpiId, isValidUpiId } from "@/lib/upi";
import { motion, AnimatePresence } from "framer-motion";

interface UpiPayModalProps {
  upiId: string;
  displayName?: string | null;
  onClose: () => void;
}

export default function UpiPayModal({
  upiId,
  displayName,
  onClose,
}: UpiPayModalProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const cleanUpi = cleanUpiId(upiId);
  const payeeName = (displayName && displayName.trim().length > 0) ? displayName.trim() : "Creator";
  const isValid = isValidUpiId(cleanUpi);

  // Generate dynamic UPI URI: upi://pay?pa={upiId}&pn={displayName}&cu=INR
  const upiUri = generateUpiUri({ upiId: cleanUpi, displayName: payeeName });

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Copy UPI ID to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cleanUpi);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = cleanUpi;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [cleanUpi]);

  // Download QR code as PNG
  const handleDownload = useCallback(() => {
    setDownloading(true);
    const svg = document.getElementById("upi-pay-qr-svg");
    if (!svg) {
      setDownloading(false);
      return;
    }

    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const size = 600; // High resolution for crisp scanning
      const padding = 50;
      canvas.width = size;
      canvas.height = size + 100; // Extra room for label at bottom
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clean white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const img = new Image();
      img.onload = () => {
        // Draw QR
        ctx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2);

        // Draw Payee Name & UPI ID text under QR
        ctx.fillStyle = "#18181b";
        ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(payeeName, size / 2, size - 10);

        ctx.fillStyle = "#71717a";
        ctx.font = "16px monospace";
        ctx.fillText(cleanUpi, size / 2, size + 20);

        ctx.fillStyle = "#9333ea";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText("Scan & Pay via any UPI App • Linkle", size / 2, size + 50);

        const a = document.createElement("a");
        const safeFilename = `${payeeName.toLowerCase().replace(/[^a-z0-9_-]/g, "-")}-upi-qr.png`;
        a.href = canvas.toDataURL("image/png");
        a.download = safeFilename;
        a.click();
        setDownloading(false);
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.error("QR download error:", err);
      setDownloading(false);
    }
  }, [payeeName, cleanUpi]);

  // Share via Web Share API or copy link
  const handleShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Pay ${payeeName} via UPI`,
          text: `Pay ${payeeName} using UPI ID: ${cleanUpi}`,
          url: upiUri,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2500);
        return;
      } catch (err: any) {
        // User cancelled share or unsupported
        if (err.name !== "AbortError") {
          console.log("Fallback to clipboard copy");
        }
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(upiUri);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch {
      handleCopy();
    }
  }, [payeeName, cleanUpi, upiUri, handleCopy]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-10 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-6 sm:p-7 w-full max-w-sm border border-gray-100 dark:border-zinc-800 text-left my-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close UPI modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl gradient-bg flex items-center justify-center text-white shadow-glow shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0 pr-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                Pay via UPI
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Support {payeeName} directly
              </p>
            </div>
          </div>

          {/* Warning badge if UPI ID looks malformed */}
          {!isValid && cleanUpi && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs mb-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Please double-check UPI format (e.g. username@bank).</span>
            </div>
          )}

          {/* Large High-Contrast QR Code Card */}
          <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-gray-100 dark:border-gray-200 shadow-sm relative overflow-hidden">
            <div className="p-1 bg-white rounded-xl">
              <QRCodeSVG
                id="upi-pay-qr-svg"
                value={upiUri}
                size={210}
                level="H"
                includeMargin={false}
                fgColor="#18181b"
                bgColor="#ffffff"
              />
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-[11px] font-medium text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero transaction fees • Instant direct transfer</span>
            </div>
          </div>

          {/* UPI ID display with Copy Action */}
          <div className="mt-3.5 flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/60">
            <div className="min-w-0 pr-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                UPI ID / VPA
              </p>
              <p className="text-xs sm:text-sm font-mono font-bold text-gray-900 dark:text-gray-100 truncate select-all">
                {cleanUpi || "No UPI ID provided"}
              </p>
            </div>
            <button
              onClick={handleCopy}
              disabled={!cleanUpi}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-600 transition-all shadow-sm active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Primary Action: "Pay via UPI" Deep Link Button */}
          <div className="mt-3">
            <a
              href={upiUri}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl gradient-bg text-white font-bold text-sm hover:opacity-95 active:scale-[0.99] transition-all shadow-glow"
            >
              <Smartphone className="w-4 h-4" />
              <span>Pay via UPI App</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
            <p className="text-[11px] text-center text-gray-400 mt-1.5">
              Works with GPay, PhonePe, Paytm, BHIM, Cred & bank apps
            </p>
          </div>

          {/* Secondary Actions: Download QR & Share */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
            <button
              onClick={handleDownload}
              disabled={downloading || !cleanUpi}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-purple-500" />
              <span>{downloading ? "Saving..." : "Download QR"}</span>
            </button>

            <button
              onClick={handleShare}
              disabled={!cleanUpi}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              {shared ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Shared!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-purple-500" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
