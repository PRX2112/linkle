"use client";

import { BusinessLink, UserTheme } from "@/lib/types";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface BusinessSectionProps {
    links: BusinessLink[];
    theme: UserTheme;
}

export default function BusinessSection({ links, theme }: BusinessSectionProps) {
    const visibleLinks = links.filter((link) => link.isVisible);

    if (visibleLinks.length === 0) return null;

    const buttonRadiusClass = 
        theme.buttonStyle === 'pill' ? 'rounded-3xl' :
        theme.buttonStyle === 'square' ? 'rounded-md' : 'rounded-xl';
    
    const thumbnailRadiusClass = 
        theme.buttonStyle === 'pill' ? 'rounded-full' :
        theme.buttonStyle === 'square' ? 'rounded-sm' : 'rounded-lg';

    return (
        <div className="w-full max-w-lg px-4 mt-8 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white px-1">
                Featured
            </h2>
            {visibleLinks.map((link, index) => (
                <Link
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track-id={link.id}
                    data-track-type="business"
                    data-track-title={link.title}
                    data-track-url={link.url}
                >
                    <div 
                        className={`bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 ${buttonRadiusClass} p-4 flex items-center gap-4 transition-all shadow-sm cursor-pointer group hover:shadow-lg`}
                        style={{ '--hover-border': 'var(--user-primary)' } as React.CSSProperties}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--user-primary)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '' }}
                    >
                        {link.thumbnailUrl && (
                            <div className={`w-16 h-16 ${thumbnailRadiusClass} overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-zinc-800`}>
                                <img
                                    src={link.thumbnailUrl}
                                    alt={link.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate flex items-center gap-2">
                                {link.title}
                            </h3>
                            {link.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                    {link.description}
                                </p>
                            )}
                        </div>
                        <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                    </div>
                </Link>
            ))}
        </div>
    );
}
