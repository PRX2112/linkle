import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
    title: "Linkle - Your Digital Hub",
    description: "One QR code, endless possibilities.",
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
