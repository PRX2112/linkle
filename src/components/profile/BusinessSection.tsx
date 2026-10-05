"use client";

import { BusinessLink, UserTheme } from "@/lib/types";
import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { buildUtmUrl } from "@/lib/utm";

interface BusinessSectionProps {
    links: BusinessLink[];
    theme: UserTheme;
}

function sanitizeUrl(rawUrl: string): string {
    const trimmed = (rawUrl || '').trim();
    const lower = trimmed.toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || lower.startsWith('data:')) {
        return '#';
    }
    return trimmed;
}

export default function BusinessSection({ links, theme }: BusinessSectionProps) {
    const visibleLinks = (links || []).filter((link) => link.isVisible);

    if (visibleLinks.length === 0) return null;

    // Separate featured links from standard links for clear visual hierarchy
    const featuredLinks = visibleLinks.filter((l) => l.featured);
    const regularLinks = visibleLinks.filter((l) => !l.featured);

    const buttonStyle = theme.buttonStyle || "pill";

    const getCardRadius = () => {
        switch (buttonStyle) {
            case "pill":
                return "rounded-2xl sm:rounded-3xl";
            case "square":
                return "rounded-none";
            case "outline":
            case "rounded":
            default:
                return "rounded-xl";
        }
    };

    const getThumbRadius = () => {
        switch (buttonStyle) {
            case "pill":
                return "rounded-xl sm:rounded-2xl";
            case "square":
                return "rounded-none";
            case "outline":
            case "rounded":
            default:
                return "rounded-lg";
        }
    };

    const cardRadiusClass = getCardRadius();
    const thumbRadiusClass = getThumbRadius();

    const renderLinkCard = (link: BusinessLink, isFeatured: boolean) => {
        const rawDestination = link.utmEnabled ? buildUtmUrl(link.url, link).url : link.url;
        const destinationUrl = sanitizeUrl(rawDestination);
        const isOutline = buttonStyle === "outline";

        return (
            <Link
                key={link.id}
                href={destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-track-id={link.id}
                data-track-type={isFeatured ? "cta" : "business"}
                data-track-title={link.title}
                data-track-url={destinationUrl}
                className="w-full block group"
            >
                <div
                    className={`w-full p-4 flex items-center gap-3.5 transition-all duration-200 border cursor-pointer active:scale-[0.99] ${cardRadiusClass} ${
                        isFeatured
                            ? isOutline
                                ? "border-2 bg-[var(--user-primary)]/5 hover:bg-[var(--user-primary)]/10 shadow-sm"
                                : "bg-white dark:bg-zinc-900 border-2 shadow-sm hover:shadow-md"
                            : isOutline
                            ? "bg-transparent border border-gray-300 dark:border-zinc-700 hover:border-[var(--user-primary)] hover:bg-[var(--user-primary)]/5"
                            : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-sm"
                    }`}
                    style={{
                        borderColor: isFeatured ? "var(--user-primary)" : undefined,
                    }}
                >
                    {/* Optional Thumbnail */}
                    {link.thumbnailUrl && (
                        <div
                            className={`w-14 h-14 sm:w-16 sm:h-16 ${thumbRadiusClass} overflow-hidden shrink-0 bg-gray-100 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800`}
                        >
                            <img
                                src={link.thumbnailUrl}
                                alt={link.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                loading="lazy"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate group-hover:text-[var(--user-primary)] transition-colors">
                                {link.title}
                            </h3>
                            {isFeatured && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--user-primary)]/10 text-[var(--user-primary)] shrink-0">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    Featured
                                </span>
                            )}
                        </div>
                        {link.description && (
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5 leading-snug">
                                {link.description}
                            </p>
                        )}
                    </div>

                    {/* Action Arrow */}
                    <div className="shrink-0 p-1.5 rounded-full text-gray-400 group-hover:text-[var(--user-primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="w-full max-w-lg px-4 mt-6 space-y-3">
            {/* Featured Links Section */}
            {featuredLinks.length > 0 && (
                <div className="space-y-3 mb-4">
                    {featuredLinks.map((link) => renderLinkCard(link, true))}
                </div>
            )}

            {/* Standard Links */}
            {regularLinks.length > 0 && (
                <div className="space-y-3">
                    {regularLinks.map((link) => renderLinkCard(link, false))}
                </div>
            )}
        </div>
    );
}
