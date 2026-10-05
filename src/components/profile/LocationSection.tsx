"use client";

import { useState } from "react";
import { LocationInfo, UserTheme } from "@/lib/types";
import { MapPin, Navigation, Map as MapIcon, ChevronDown, ChevronUp } from "lucide-react";

interface LocationSectionProps {
    location?: LocationInfo;
    theme: UserTheme;
}

export default function LocationSection({ location, theme }: LocationSectionProps) {
    const [showMap, setShowMap] = useState(false);

    if (!location || !location.isVisible || (!location.address && !location.googleMapsEmbedUrl)) {
        return null;
    }

    const buttonStyle = theme.buttonStyle || "pill";

    const getRadiusClass = () => {
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

    const isOutline = buttonStyle === "outline";
    const radiusClass = getRadiusClass();

    const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        location.address || ""
    )}`;

    return (
        <div className="w-full max-w-lg px-4 mt-6">
            <div
                className={`overflow-hidden border transition-all duration-200 ${radiusClass} ${
                    isOutline
                        ? "bg-transparent border border-gray-300 dark:border-zinc-700"
                        : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-xs"
                }`}
            >
                {/* Embedded Map (Lazy loaded, expandable or compact) */}
                {location.googleMapsEmbedUrl && showMap && (
                    <div className="w-full h-44 sm:h-52 bg-gray-100 dark:bg-zinc-800 relative border-b border-gray-200 dark:border-zinc-800 animate-in fade-in duration-200">
                        <iframe
                            src={location.googleMapsEmbedUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            sandbox="allow-scripts allow-same-origin"
                            title="Location Map"
                        />
                    </div>
                )}

                {/* Address & Actions Row */}
                <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-[var(--user-primary)]/10 text-[var(--user-primary)] shrink-0 mt-0.5">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">
                                Location
                            </span>
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug break-words mt-0.5">
                                {location.address || "Location on map"}
                            </p>
                        </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                        {location.googleMapsEmbedUrl && (
                            <button
                                type="button"
                                onClick={() => setShowMap(!showMap)}
                                className="p-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-750 text-gray-600 dark:text-gray-300 transition-colors"
                                title={showMap ? "Hide Map" : "Show Map"}
                                aria-label={showMap ? "Hide Map" : "Show Map"}
                            >
                                <MapIcon className="w-4 h-4" />
                            </button>
                        )}

                        {location.showDirectionsBtn && location.address && (
                            <a
                                href={directionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[var(--user-primary)] text-white text-xs font-semibold shadow-xs hover:opacity-90 transition-opacity"
                                title="Get Directions"
                            >
                                <Navigation className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Directions</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
