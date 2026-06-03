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
import { motion } from "framer-motion";

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

const platformConfig: Record<string, { bg: string; hoverBg: string; text: string }> = {
    instagram: {
        bg: "bg-transparent",
        hoverBg: "hover:bg-purple-600",
        text: "text-white",
    },
    facebook: {
        bg: "bg-transparent",
        hoverBg: "hover:bg-blue-700",
        text: "text-white",
    },
    twitter: {
        bg: "bg-transparent",
        hoverBg: "hover:bg-sky-600",
        text: "text-white",
    },
    linkedin: {
        bg: "bg-transparent",
        hoverBg: "hover:bg-blue-800",
        text: "text-white",
    },
    youtube: {
        bg: "bg-transparent",
        hoverBg: "hover:bg-red-700",
        text: "text-white",
    },
    github: {
        bg: "bg-transparent",
        hoverBg: "hover:bg-gray-900 dark:hover:bg-gray-600",
        text: "text-white",
    },
    dribbble: {
        bg: "bg-transparent",
        hoverBg: "hover:bg-pink-600",
        text: "text-white",
    },
    behance: {
        bg: "bg-transparent",
        hoverBg: "hover:bg-blue-600",
        text: "text-white",
    },
    email: {
        bg: "bg-transparent",
        hoverBg: "hover:bg-indigo-600",
        text: "text-white",
    },
    phone: {
        bg: "bg-transparent",
        hoverBg: "hover:bg-green-600",
        text: "text-white",
    },
    website: {
        bg: "bg-transparent",
        hoverBg: "hover:bg-purple-600",
        text: "text-white",
    },
    whatsapp: {
        bg: "bg-transparent",
        hoverBg: "hover:bg-green-700",
        text: "text-white",
    },
    telegram: {
        bg: "bg-transparent",
        hoverBg: "hover:bg-blue-600",
        text: "text-white",
    },
};

export default function SocialLinks({ links, theme }: SocialLinksProps) {
    const visibleLinks = links.filter((link) => link.isVisible);

    if (visibleLinks.length === 0) return null;

    const buttonRadiusClass = 
        theme.buttonStyle === 'pill' ? 'rounded-full' :
        theme.buttonStyle === 'square' ? 'rounded-md' : 'rounded-2xl';

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6 mt-8 max-w-lg px-4 mx-auto"
        >
            {visibleLinks.map((link, index) => {
                const Icon = iconMap[link.platform] || Globe;
                const config = platformConfig[link.platform] || {
                    bg: "bg-gray-600",
                    hoverBg: "hover:bg-gray-700",
                    text: "text-white",
                };

                return (
                    <motion.div
                        key={link.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                    >
                        <Link
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-track-id={link.id}
                            data-track-type="social"
                            data-track-title={link.platform}
                            data-track-url={link.url}
                            className={`
                                w-14 h-14
                                flex items-center justify-center
                                ${buttonRadiusClass}
                                hover:scale-110
                                transition-all
                                shadow-lg hover:shadow-xl
                                bg-white dark:bg-zinc-800
                                text-gray-700 dark:text-gray-200
                                hover:text-white
                            `}
                            style={{ '--hover-bg': 'var(--user-primary)' } as React.CSSProperties}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--user-primary)';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '';
                                e.currentTarget.style.color = '';
                            }}
                            aria-label={link.label || link.platform}
                        >
                            <Icon className="w-6 h-6" />
                        </Link>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
