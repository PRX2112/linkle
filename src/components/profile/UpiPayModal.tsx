"use client";

import React, { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, Download, Share2, Smartphone, ExternalLink, QrCode } from "lucide-react";
import { generateUpiUri, cleanUpiId, isValidUpiId } from "@/lib/upi";
import { motion, AnimatePresence } from "framer-motion";
import { tracker } from "@/lib/analytics/tracker";

interface UpiPayModalProps {
  upiId: string;
  displayName?: string | null;
  userId?: string;
  onClose: () => void;
}

export default function UpiPayModal({
  upiId,
  displayName,
  userId,
  onClose,
}: UpiPayModalProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const cleanUpi = cleanUpiId(upiId);
  const payeeName = displayName && displayName.trim().length > 0 ? displayName.trim() : "Creator";
  const isValid = isValidUpiId(cleanUpi);

  // Generate standard UPI payment URI
  const upiUri = generateUpiUri({ upiId: cleanUpi, displayName: payeeName });

  // Detect mobile device
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = navigator.userAgent || "";
      const mobileRegex = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i;
      setIsMobile(mobileRegex.test(userAgent) || window.innerWidth < 768);
    }
  }, []);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Copy UPI ID to clipboard
  const handleCopy = useCallback(async () => {
    if (userId) {
      tracker.upiCopy(userId, cleanUpi);
    }
    try {
      await navigator.clipboard.writeText(cleanUpi);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = cleanUpi;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [cleanUpi, userId]);

  // Download high-resolution branded QR code PNG
  const handleDownload = useCallback(() => {
    if (userId) {
      tracker.qrDownload(userId, "upi_qr");
    }
    setDownloading(true);
    const svg = document.getElementById("linkle-upi-qr-svg");
    if (!svg) {
      setDownloading(false);
      return;
    }

    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const size = 600;
      const padding = 50;
      canvas.width = size;
      canvas.height = size + 100;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2);

        ctx.fillStyle = "#18181b";
        ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(payeeName, size / 2, size - 10);

        ctx.fillStyle = "#71717a";
        ctx.font = "16px monospace";
        ctx.fillText(cleanUpi, size / 2, size + 20);

        ctx.fillStyle = "#6366f1";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText("Scan & Pay via any UPI App • Linkle Pay", size / 2, size + 50);

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
  }, [payeeName, cleanUpi, userId]);

  // Share payment link
  const handleShare = useCallback(async () => {
    if (userId) {
      tracker.profileShare(userId, "upi_modal");
    }
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Pay ${payeeName} via UPI`,
          text: `Pay ${payeeName} using UPI ID: ${cleanUpi}`,
          url: upiUri,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.log("Fallback to copy");
        }
      }
    }

    try {
      await navigator.clipboard.writeText(upiUri);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      handleCopy();
    }
  }, [payeeName, cleanUpi, upiUri, handleCopy, userId]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="upi-modal-title"
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="relative z-10 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-5 sm:p-6 w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto border border-gray-200 dark:border-zinc-800 text-left my-auto space-y-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--user-primary)]">
                Linkle Pay
              </span>
              <h2 id="upi-modal-title" className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                Pay {payeeName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="min-w-[36px] min-h-[36px] p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center -mr-1 -mt-1 shrink-0"
              aria-label="Close UPI payment modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* High-Contrast QR Code Card */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 shadow-2xs">
            <div className="p-1 bg-white rounded-lg">
              <QRCodeSVG
                id="linkle-upi-qr-svg"
                value={upiUri}
                size={200}
                level="H"
                includeMargin={false}
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>
            <p className="mt-2 text-[11px] font-medium text-gray-500 text-center">
              Scan with GPay, PhonePe, Paytm, BHIM, or any UPI app
            </p>
          </div>

          {/* UPI ID Row with Copy Action */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                UPI ID
              </span>
              <span className="text-xs sm:text-sm font-mono font-bold text-gray-900 dark:text-gray-100 truncate block select-all">
                {cleanUpi}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-650 transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  <span className="text-green-600 dark:text-green-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Primary Action Button (Deep link on mobile, Copy on desktop) */}
          <div className="space-y-2">
            <a
              href={upiUri}
              onClick={() => {
                if (userId) {
                  tracker.upiOpen(userId, cleanUpi);
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--user-primary)] text-white font-bold text-sm shadow-sm transition-opacity hover:opacity-90 active:scale-[0.99]"
            >
              <Smartphone className="w-4 h-4" />
              <span>Pay via UPI App</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-750 transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading ? "Saving..." : "Save QR"}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-750 transition-colors"
              >
                {shared ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    <span>Shared</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
