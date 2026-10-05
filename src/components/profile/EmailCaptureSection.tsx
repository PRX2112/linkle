"use client";

import { UserTheme } from "@/lib/types";
import { useState } from "react";
import { Mail, Check, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EmailCaptureSectionProps {
    username: string;
    enabled: boolean;
    title: string;
    placeholder: string;
    theme: UserTheme;
    isPreview?: boolean;
}

export default function EmailCaptureSection({
    username,
    enabled,
    title,
    placeholder,
    theme,
    isPreview = false,
}: EmailCaptureSectionProps) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    if (!enabled) return null;

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

    const getInputRadius = () => {
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
    const inputRadiusClass = getInputRadius();

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setErrorMsg("Enter a valid email address.");
            setStatus("error");
            return;
        }

        setStatus("loading");
        setErrorMsg("");

        try {
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email: trimmedEmail }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                setStatus("success");
                setEmail("");
            } else if (res.status === 429) {
                setErrorMsg("Please try again later.");
                setStatus("error");
            } else if (data.error && /already/i.test(data.error)) {
                setErrorMsg("You're already subscribed.");
                setStatus("error");
            } else {
                setErrorMsg(data.error || "Subscription could not be processed. Please try again.");
                setStatus("error");
            }
        } catch {
            setErrorMsg("Network error. Please try again.");
            setStatus("error");
        }
    };

    return (
        <div className="w-full max-w-lg px-4 mt-6">
            <div
                className={`p-5 sm:p-6 border transition-all duration-200 ${radiusClass} ${
                    isOutline
                        ? "bg-transparent border border-gray-300 dark:border-zinc-700"
                        : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-xs"
                }`}
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3.5">
                    <div className="w-9 h-9 rounded-lg bg-[var(--user-primary)]/10 text-[var(--user-primary)] flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                            {title || "Stay connected"}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Get updates directly in your inbox
                        </p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {status === "success" ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="py-3 text-center space-y-2"
                        >
                            <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto">
                                <Check className="w-4 h-4" />
                            </div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                You&apos;re subscribed!
                            </p>
                            <button
                                type="button"
                                onClick={() => setStatus("idle")}
                                className="text-xs font-semibold text-[var(--user-primary)] hover:underline"
                            >
                                Subscribe another email
                            </button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubscribe} className="space-y-2.5">
                            <div className={isPreview ? "flex flex-col gap-2 w-full" : "flex flex-col sm:flex-row gap-2"}>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (status === "error") setStatus("idle");
                                    }}
                                    placeholder={placeholder || "your@email.com"}
                                    className={`flex-1 px-3.5 py-2.5 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--user-primary)]/30 ${inputRadiusClass}`}
                                />
                                <button
                                    type="submit"
                                    disabled={status === "loading"}
                                    className={`px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 shrink-0 shadow-xs flex items-center justify-center gap-1.5 ${inputRadiusClass}`}
                                    style={{
                                        backgroundColor: "var(--user-primary)",
                                    }}
                                >
                                    {status === "loading" ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Subscribing...</span>
                                        </>
                                    ) : (
                                        <span>Subscribe</span>
                                    )}
                                </button>
                            </div>

                            {status === "error" && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 pt-1"
                                >
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{errorMsg}</span>
                                </motion.div>
                            )}
                        </form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
