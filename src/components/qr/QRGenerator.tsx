"use client";

import { QRCodeSVG } from "qrcode.react";
import { Download } from "lucide-react";
import { tracker } from "@/lib/analytics/tracker";

interface QRGeneratorProps {
    url: string;
    size?: number;
    userId?: string;
}

export default function QRGenerator({ url, size = 200, userId }: QRGeneratorProps) {
    const downloadQR = () => {
        if (userId) {
            tracker.qrDownload(userId, "profile_qr");
        }
        const svg = document.getElementById("profile-qr-code");
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = size;
            canvas.height = size;
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const pngFile = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.download = "my-linkle-qr.png";
                downloadLink.href = pngFile;
                downloadLink.click();
            }
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    return (
        <div className="flex flex-col items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <div className="bg-white p-2 rounded-xl">
                <QRCodeSVG
                    id="profile-qr-code"
                    value={url}
                    size={size}
                    level={"H"}
                    includeMargin={true}
                />
            </div>
            <button
                onClick={downloadQR}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
            >
                <Download className="w-4 h-4" />
                Download QR
            </button>
        </div>
    );
}
