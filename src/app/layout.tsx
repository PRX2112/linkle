import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

export const metadata: Metadata = {
    metadataBase: new URL(appUrl),
    title: {
        default: "Linkle - One Link for Everything",
        template: "%s",
    },
    description: "One QR code, endless possibilities. Connect all your social links, business links, and payment methods in one beautiful personalized link-in-bio page.",
    applicationName: "Linkle",
    authors: [{ name: "Linkle" }],
    creator: "Linkle",
    publisher: "Linkle",
    keywords: [
        "link in bio",
        "bio link",
        "digital business card",
        "qr code",
        "social profile",
        "upi payments",
        "linkle",
    ],
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: appUrl,
        siteName: "Linkle",
        title: "Linkle - One Link for Everything",
        description: "Connect all your social links, business links, and payment methods in one beautiful personalized link-in-bio page.",
        images: [
            {
                url: "/logo.png",
                width: 512,
                height: 512,
                alt: "Linkle Logo",
            },
        ],
    },
    twitter: {
        card: "summary",
        title: "Linkle - One Link for Everything",
        description: "One QR code, endless possibilities. Connect all your social links, business links, and payment methods in one beautiful personalized link-in-bio page.",
        images: ["/logo.png"],
        creator: "@linkle",
    },
    icons: {
        icon: [
            { url: "/favicon.ico" },
            { url: "/favicon.png", sizes: "32x32", type: "image/png" },
            { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { url: "/logo.png", sizes: "512x512", type: "image/png" },
        ],
        apple: [
            { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
            { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
    },
    manifest: "/manifest.webmanifest",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
