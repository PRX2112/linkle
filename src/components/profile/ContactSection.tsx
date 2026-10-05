"use client";

import { ContactAction, UserTheme } from "@/lib/types";
import { Calendar, Download, FileText, UserPlus, Phone, Mail, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface ContactSectionProps {
    actions: ContactAction[];
    theme: UserTheme;
    displayName?: string | null;
    username?: string;
}

const iconMap: Record<string, React.ComponentType<any>> = {
    vcard: UserPlus,
    book_appointment: Calendar,
    download_resume: Download,
    custom_form: FileText,
};

export default function ContactSection({ actions, theme, displayName, username }: ContactSectionProps) {
    const visibleActions = (actions || []).filter((action) => action.isVisible);

    if (visibleActions.length === 0) return null;

    const buttonStyle = theme.buttonStyle || "pill";

    const getRadiusClass = () => {
        switch (buttonStyle) {
            case "pill":
                return "rounded-full";
            case "square":
                return "rounded-none";
            case "outline":
            case "rounded":
            default:
                return "rounded-xl";
        }
    };

    const isOutline = buttonStyle === "outline";
    const radiusClass = getRadiusClass();

    const handleVCardDownload = (e: React.MouseEvent, action: ContactAction) => {
        // If action has a real external URL, allow normal navigation
        if (action.url && action.url !== "#" && /^https?:\/\//i.test(action.url)) {
            return;
        }

        e.preventDefault();
        const contactName = displayName || username || "Contact";
        const currentUrl = typeof window !== "undefined" ? window.location.href : "";

        const vCardData = [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `FN:${contactName}`,
            `N:;${contactName};;;`,
            `URL:${currentUrl}`,
            "NOTE:Saved from Linkle Profile",
            "END:VCARD",
        ].join("\r\n");

        const blob = new Blob([vCardData], { type: "text/vcard;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${contactName.toLowerCase().replace(/[^a-z0-9_-]/g, "-")}.vcf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full max-w-lg px-4 mt-6 space-y-2.5">
            {visibleActions.map((action) => {
                const Icon = iconMap[action.type] || FileText;
                const isVCard = action.type === "vcard";
                const destination = action.url || "#";

                return (
                    <Link
                        key={action.id}
                        href={destination}
                        target={isVCard && (!action.url || action.url === "#") ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        onClick={isVCard ? (e) => handleVCardDownload(e, action) : undefined}
                        data-track-id={action.id}
                        data-track-type="contact"
                        data-track-title={action.label}
                        data-track-url={destination}
                        className="w-full block group"
                    >
                        <div
                            className={`w-full py-3.5 px-4 flex items-center justify-center gap-2.5 font-bold text-xs sm:text-sm transition-all duration-200 shadow-xs active:scale-[0.99] ${radiusClass} ${
                                isOutline
                                    ? "bg-transparent border-2 border-[var(--user-primary)] text-[var(--user-primary)] hover:bg-[var(--user-primary)]/10"
                                    : "text-white hover:opacity-90 shadow-sm"
                            }`}
                            style={{
                                backgroundColor: isOutline ? "transparent" : "var(--user-primary)",
                                color: isOutline ? "var(--user-primary)" : "white",
                            }}
                        >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{action.label}</span>
                            {!isVCard && <ArrowUpRight className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />}
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
