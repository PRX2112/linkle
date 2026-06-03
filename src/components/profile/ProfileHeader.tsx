"use client";

import { UserProfile } from "@/lib/types";
import { BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileHeaderProps {
    displayName: string;
    username: string;
    bio: string;
    avatarUrl: string | null;
    bannerUrl?: string;
}

export default function ProfileHeader({
    displayName,
    username,
    bio,
    avatarUrl,
    bannerUrl,
}: ProfileHeaderProps) {
    return (
        <div className="w-full flex flex-col items-center">
            {/* Banner */}
            <div className="w-full h-32 md:h-48 overflow-hidden rounded-b-2xl relative bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
                {bannerUrl && (
                    <img
                        src={bannerUrl}
                        alt="Banner"
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Avatar */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="-mt-16 mb-4 relative z-10"
            >
                <div className="rounded-full p-1 bg-gradient-to-br from-purple-500 to-pink-500 shadow-glow">
                    <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-background shadow-lg">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-600 font-bold text-2xl uppercase">
                            {(() => {
                              const parts = displayName.trim().split(/\s+/);
                              if (parts.length === 1) {
                                return parts[0][0].toUpperCase();
                              }
                              return (parts[0][0] + parts[1][0]).toUpperCase();
                            })()}
                          </div>
                        )}

                    </div>
                </div>
            </motion.div>

            {/* Info */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-center px-4 max-w-md"
            >
                <h1 className="text-3xl font-black flex items-center justify-center gap-2">
                    {displayName}
                    <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500" />
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">@{username}</p>
                <p className="mt-4 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    {bio}
                </p>
            </motion.div>
        </div>
    );
}
