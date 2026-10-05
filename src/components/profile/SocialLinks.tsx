"use client";

import { SocialLink, UserTheme } from "@/lib/types";
import {
    Instagram,
    Facebook,
    Twitter,
    Linkedin,
    Youtube,
    Github,
    Dribbble,
    Mail,
    Phone,
    Globe,
    Send,
    MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { buildUtmUrl } from "@/lib/utm";

interface SocialLinksProps {
    links: SocialLink[];
    theme: UserTheme;
}

const iconMap: Record<string, React.ComponentType<any>> = {
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
    github: Github,
    dribbble: Dribbble,
    behance: Dribbble,
    email: Mail,
    phone: Phone,
    website: Globe,
    whatsapp: MessageCircle,
    telegram: Send,
};

function sanitizeUrl(rawUrl: string): string {
    const trimmed = (rawUrl || '').trim();
    const lower = trimmed.toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || lower.startsWith('data:')) {
        return '#';
    }
    return trimmed;
}

export default function SocialLinks({ links, theme }: SocialLinksProps) {
    const visibleLinks = (links || []).filter((link) => link.isVisible);

    if (visibleLinks.length === 0) return null;

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

    return (
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-5 max-w-lg px-4 mx-auto">
            {visibleLinks.map((link) => {
                const Icon = iconMap[link.platform] || Globe;
                const rawDestination = link.utmEnabled ? buildUtmUrl(link.url, link).url : link.url;
                const destinationUrl = sanitizeUrl(rawDestination);
                const platformLabel = link.label || link.platform.charAt(0).toUpperCase() + link.platform.slice(1);

                return (
                    <Link
                        key={link.id}
                        href={destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-track-id={link.id}
                        data-track-type="social"
                        data-track-title={link.platform}
                        data-track-url={destinationUrl}
                        aria-label={platformLabel}
                        title={platformLabel}
                        className={`
                            w-11 h-11 sm:w-12 sm:h-12
                            flex items-center justify-center
                            ${radiusClass}
                            transition-all duration-200
                            ${
                                isOutline
                                    ? "bg-transparent border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-200 hover:border-[var(--user-primary)] hover:text-[var(--user-primary)]"
                                    : "bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 shadow-xs hover:shadow-sm hover:border-gray-300 dark:hover:border-zinc-700"
                            }
                            hover:scale-105 active:scale-95
                        `}
                        onMouseEnter={(e) => {
                            if (!isOutline) {
                                e.currentTarget.style.color = "var(--user-primary)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isOutline) {
                                e.currentTarget.style.color = "";
                            }
                        }}
                    >
                        <Icon className="w-5 h-5 transition-colors" />
                    </Link>
                );
            })}
        </div>
    );
}
