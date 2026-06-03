"use client";

import { ContactAction, UserTheme } from "@/lib/types";
import { Calendar, Download, FileText, UserPlus } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ContactSectionProps {
    actions: ContactAction[];
    theme: UserTheme;
}

const iconMap: Record<string, React.ComponentType<any>> = {
    vcard: UserPlus,
    book_appointment: Calendar,
    download_resume: Download,
    custom_form: FileText,
};

export default function ContactSection({ actions, theme }: ContactSectionProps) {
    const visibleActions = actions.filter((action) => action.isVisible);

    if (visibleActions.length === 0) return null;

    const buttonRadiusClass = 
        theme.buttonStyle === 'pill' ? 'rounded-full' :
        theme.buttonStyle === 'square' ? 'rounded-md' : 'rounded-2xl';

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="w-full max-w-lg px-4 mt-8 flex flex-col gap-3"
        >
            {visibleActions.map((action, index) => {
                const Icon = iconMap[action.type] || FileText;
                return (
                    <Link
                        key={action.id}
                        href={action.url || "#"}
                        target="_blank"
                        data-track-id={action.id}
                        data-track-type="contact"
                        data-track-title={action.label}
                        data-track-url={action.url || "#"}
                        className="w-full block"
                    >
                        <motion.button
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full text-white py-4 ${buttonRadiusClass} font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-glow`}
                            style={{ backgroundColor: 'var(--user-primary)' }}
                        >
                            <Icon className="w-5 h-5" />
                            {action.label}
                        </motion.button>
                    </Link>
                );
            })}
        </motion.div>
    );
}
