"use client";

import { LocationInfo, UserTheme } from "@/lib/types";
import { MapPin, Navigation } from "lucide-react";

interface LocationSectionProps {
    location?: LocationInfo;
    theme: UserTheme;
}

export default function LocationSection({ location, theme }: LocationSectionProps) {
    if (!location || !location.isVisible) return null;

    const buttonRadiusClass = 
        theme.buttonStyle === 'pill' ? 'rounded-2xl' :
        theme.buttonStyle === 'square' ? 'rounded-md' : 'rounded-xl';

    return (
        <div className="w-full max-w-lg px-4 mt-8">
            <div className={`bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm ${buttonRadiusClass}`}>
                {location.googleMapsEmbedUrl && (
                    <div className="w-full h-48 bg-gray-200 dark:bg-zinc-800 relative">
                        <iframe
                            src={location.googleMapsEmbedUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            sandbox="allow-scripts allow-same-origin"
                        />
                    </div>
                )}
                <div className="p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--user-primary) 20%, transparent)', color: 'var(--user-primary)' }}>
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Location
                            </p>
                            <p className="text-gray-900 dark:text-gray-100 font-medium">
                                {location.address}
                            </p>
                        </div>
                    </div>
                    {location.showDirectionsBtn && (
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                location.address
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
                            title="Get Directions"
                        >
                            <Navigation className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
