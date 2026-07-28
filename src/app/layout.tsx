import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
    title: "Linkle - Your Digital Hub",
    description: "One QR code, endless possibilities. Connect all your social links, business links, and payment methods in one beautiful personalized link-in-bio page.",
    icons: {
        icon: [
            { url: "/favicon.ico" },
            { url: "/favicon.png", sizes: "16x16", type: "image/png" },
            { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { url: "/logo.png", sizes: "512x512", type: "image/png" },
        ],
        apple: [
            { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
            { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`antialiased`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
