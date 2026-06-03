"use client";

import { UserTheme } from "@/lib/types";
import { useState } from "react";
import { Mail, Check, AlertCircle } from "lucide-react";
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

    const cardRadiusClass = 
        theme.buttonStyle === 'pill' ? 'rounded-3xl' :
        theme.buttonStyle === 'square' ? 'rounded-md' : 'rounded-xl';

    const inputRadiusClass = 
        theme.buttonStyle === 'pill' ? 'rounded-full' :
        theme.buttonStyle === 'square' ? 'rounded-md' : 'rounded-xl';

    const buttonRadiusClass = 
        theme.buttonStyle === 'pill' ? 'rounded-full' :
        theme.buttonStyle === 'square' ? 'rounded-md' : 'rounded-xl';

    const iconRadiusClass = 
        theme.buttonStyle === 'square' ? 'rounded-md' : 'rounded-xl';

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes("@")) {
            setErrorMsg("Please enter a valid email address.");
            setStatus("error");
            return;
        }

        setStatus("loading");
        setErrorMsg("");

        try {
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email }),
            });

            if (res.ok) {
                setStatus("success");
                setEmail("");
            } else {
                const data = await res.json();
                setErrorMsg(data.error || "Failed to subscribe. Please try again.");
                setStatus("error");
            }
        } catch (err) {
            setErrorMsg("Something went wrong. Please check your connection.");
            setStatus("error");
        }
    };

    return (
        <div className="w-full max-w-lg px-4 mt-8">
            <div className={`p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] ${cardRadiusClass}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 ${iconRadiusClass}`}>
                        <Mail className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            {title || "Subscribe to my newsletter"}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
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
                            className="flex flex-col items-center justify-center py-4 text-center"
                        >
                            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-3">
                                <Check className="w-6 h-6 animate-bounce" />
                            </div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Subscribed!</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Thank you for subscribing to our newsletter.
                            </p>
                            <button
                                onClick={() => setStatus("idle")}
                                className="mt-4 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                            >
                                Subscribe another email
                            </button>
                        </motion.div>
                    ) : (
                        <motion.form
                            onSubmit={handleSubscribe}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                        >
                            <div className={isPreview ? "flex flex-col gap-2 w-full" : "flex flex-col sm:flex-row gap-2"}>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (status === "error") setStatus("idle");
                                    }}
                                    placeholder={placeholder || "Enter your email"}
                                    className={`flex-1 px-4 py-3 border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 ${inputRadiusClass}`}
                                />
                                <button
                                    type="submit"
                                    disabled={status === "loading"}
                                    className={`px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 shrink-0 ${buttonRadiusClass}`}
                                    style={{
                                        backgroundColor: "var(--user-primary)",
                                    }}
                                >
                                    {status === "loading" ? "Subscribing..." : "Subscribe"}
                                </button>
                            </div>

                            {status === "error" && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-1.5 text-xs text-red-500"
                                >
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>{errorMsg}</span>
                                </motion.div>
                            )}
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
