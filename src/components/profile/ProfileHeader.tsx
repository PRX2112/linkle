"use client";

import { motion } from "framer-motion";

interface ProfileHeaderProps {
    displayName: string | null;
    username: string;
    bio: string | null;
    avatarUrl: string | null;
    bannerUrl?: string | null;
}

export default function ProfileHeader({
    displayName,
    username,
    bio,
    avatarUrl,
    bannerUrl,
}: ProfileHeaderProps) {
    const nameToUse = displayName || username || "User";
    const hasBanner = Boolean(bannerUrl && bannerUrl.trim().length > 0);

    return (
        <div className="w-full flex flex-col items-center">
            {/* Banner: Rendered ONLY if real bannerUrl exists */}
            {hasBanner ? (
                <div className="w-full h-36 sm:h-48 md:h-56 overflow-hidden rounded-b-2xl sm:rounded-b-3xl relative bg-zinc-100 dark:bg-zinc-800">
                    <img
                        src={bannerUrl!}
                        alt={`${nameToUse}'s profile banner`}
                        className="w-full h-full object-cover"
                        loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
            ) : null}

            {/* Avatar Container */}
            <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`${hasBanner ? "-mt-14 sm:-mt-16" : "pt-8 sm:pt-12"} mb-4 relative z-10`}
            >
                <div className="relative rounded-full p-1 bg-background ring-2 ring-[var(--user-primary)]/20 shadow-md">
                    <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden border-4 border-background dark:border-zinc-950 shadow-inner bg-zinc-100 dark:bg-zinc-800">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={nameToUse}
                                className="w-full h-full object-cover"
                                loading="eager"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold text-2xl uppercase select-none">
                                {(() => {
                                    const parts = nameToUse.trim().split(/\s+/);
                                    if (parts.length === 1) {
                                        return parts[0][0]?.toUpperCase() || "U";
                                    }
                                    return ((parts[0][0] || "") + (parts[1][0] || "")).toUpperCase();
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Profile Identity Details */}
            <motion.div
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.08 }}
                className="text-center px-4 max-w-md w-full"
            >
                {/* Headline Display Name */}
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                    {nameToUse}
                </h1>

                {/* Canonical Username Handle */}
                <p className="text-xs sm:text-sm font-medium font-mono text-gray-500 dark:text-gray-400 mt-1 select-all">
                    @{username}
                </p>

                {/* Supporting Bio */}
                {bio && bio.trim().length > 0 && (
                    <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line break-words">
                        {bio}
                    </p>
                )}
            </motion.div>
        </div>
    );
}
