"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, QrCode, X } from "lucide-react";

interface QRCodeModalProps {
  username: string;
  displayName?: string | null;
  onClose: () => void;
}

export default function QRCodeModal({ username, displayName, onClose }: QRCodeModalProps) {
  const appBase = typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_APP_URL || "https://linklez.vercel.app");
  const cleanUsername = username.trim().toLowerCase();
  const profileUrl = `${appBase}/p/${cleanUsername}`;
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleDownload = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, size, size);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 20, 20, size - 40, size - 40);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `${cleanUsername}-linkle-qr.png`;
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-title"
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm relative max-h-[calc(100dvh-2rem)] overflow-y-auto"
      >
        <button
          onClick={onClose}
          aria-label="Close QR Code dialog"
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h2 id="qr-modal-title" className="text-lg font-bold text-gray-900 dark:text-white">QR Code</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Share your profile instantly</p>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 mb-6 shadow-inner">
          <QRCodeSVG
            id="qr-code-svg"
            value={profileUrl}
            size={200}
            level="H"
            includeMargin={false}
            fgColor="#1e1e2e"
          />
        </div>

        <p className="text-center text-xs text-gray-400 font-mono mb-6 truncate">{profileUrl}</p>

        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-bg text-white font-semibold hover:opacity-90 transition-all shadow-glow"
        >
          <Download className="w-4 h-4" />
          Download QR Code (PNG)
        </button>
      </div>
    </div>
  );
}
