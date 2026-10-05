"use client";

import { PaymentOption, UserTheme } from "@/lib/types";
import { CreditCard, Wallet, Smartphone, DollarSign, ArrowUpRight, Copy, Check, QrCode } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import UpiPayModal from "./UpiPayModal";
import { tracker } from "@/lib/analytics/tracker";

interface PaymentSectionProps {
    payments: PaymentOption[];
    theme: UserTheme;
    displayName?: string | null;
    username?: string;
    userId?: string;
}

const iconMap: Record<string, React.ComponentType<any>> = {
    paypal: Wallet,
    stripe: CreditCard,
    upi: Smartphone,
    crypto: DollarSign,
    paytm: Smartphone,
    phonepe: Smartphone,
    googlepay: Smartphone,
};

export default function PaymentSection({
    payments,
    theme,
    displayName,
    username,
    userId,
}: PaymentSectionProps) {
    const visiblePayments = (payments || []).filter((p) => p.isVisible);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeUpiPayment, setActiveUpiPayment] = useState<PaymentOption | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    if (visiblePayments.length === 0) return null;

    const payeeName = displayName || username || "Creator";
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

    const radiusClass = getRadiusClass();
    const isOutline = buttonStyle === "outline";

    // Separate UPI from other payment links
    const upiPayment = visiblePayments.find((p) => p.platform === "upi");
    const otherPayments = visiblePayments.filter((p) => p.platform !== "upi");

    const handleCopyValue = async (paymentId: string, val: string) => {
        try {
            await navigator.clipboard.writeText(val);
            setCopiedId(paymentId);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            // ignore
        }
    };

    return (
        <div className="w-full max-w-lg px-4 mt-6 space-y-3">
            {/* Primary Linkle Pay UPI Option if configured */}
            {upiPayment && (
                <div
                    onClick={() => {
                        if (userId) {
                            tracker.upiOpen(userId, upiPayment.value);
                        }
                        setActiveUpiPayment(upiPayment);
                    }}
                    data-track-id={upiPayment.id}
                    data-track-type="payment"
                    data-track-title="UPI"
                    data-track-url={upiPayment.value}
                    className={`w-full p-4.5 flex items-center justify-between gap-3 border transition-all duration-200 cursor-pointer active:scale-[0.99] ${radiusClass} ${
                        isOutline
                            ? "border-2 border-[var(--user-primary)] bg-[var(--user-primary)]/5 hover:bg-[var(--user-primary)]/10"
                            : "bg-white dark:bg-zinc-900 border-2 border-[var(--user-primary)]/40 hover:border-[var(--user-primary)] shadow-sm hover:shadow-md"
                    }`}
                >
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-[var(--user-primary)]/10 text-[var(--user-primary)] flex items-center justify-center shrink-0">
                            <Smartphone className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                                    Pay via UPI
                                </h3>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--user-primary)] text-white shrink-0">
                                    Linkle Pay
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate mt-0.5">
                                {upiPayment.value}
                            </p>
                        </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-[var(--user-primary)] bg-[var(--user-primary)]/10 px-3 py-1.5 rounded-lg">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Pay</span>
                    </div>
                </div>
            )}

            {/* Non-UPI Payment Options (Stripe, PayPal, Crypto, etc.) */}
            {otherPayments.length > 0 && (
                <div className="space-y-2.5">
                    {otherPayments.map((payment) => {
                        const Icon = iconMap[payment.platform] || DollarSign;
                        const isExpanded = expandedId === payment.id;
                        const isCopied = copiedId === payment.id;
                        const platformName = payment.platform.charAt(0).toUpperCase() + payment.platform.slice(1);

                        return (
                            <div key={payment.id} className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!isExpanded && userId) {
                                            tracker.paymentClick(userId, payment.id, payment.platform, payment.value);
                                        }
                                        setExpandedId(isExpanded ? null : payment.id);
                                    }}
                                    data-track-id={payment.id}
                                    data-track-type="payment"
                                    data-track-title={payment.platform}
                                    data-track-url={payment.value}
                                    className={`w-full p-3.5 flex items-center justify-between gap-3 border transition-all duration-200 ${radiusClass} ${
                                        isExpanded
                                            ? "border-[var(--user-primary)] bg-[var(--user-primary)]/5"
                                            : isOutline
                                            ? "bg-transparent border border-gray-300 dark:border-zinc-700 hover:border-[var(--user-primary)]"
                                            : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 shadow-xs"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 flex items-center justify-center shrink-0">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="text-left min-w-0">
                                            <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white block truncate">
                                                {platformName}
                                            </span>
                                            <span className="text-[11px] text-gray-500 dark:text-gray-400 block truncate">
                                                Click to view details
                                            </span>
                                        </div>
                                    </div>

                                    <div className="shrink-0 text-gray-400 text-xs font-medium">
                                        {isExpanded ? "Close" : "View"}
                                    </div>
                                </button>

                                {/* Dropdown Details */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            className={`mt-1.5 p-4 bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-750 ${radiusClass} space-y-3`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                    {platformName} Address / Handle
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyValue(payment.id, payment.value)}
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--user-primary)] hover:underline"
                                                >
                                                    {isCopied ? (
                                                        <>
                                                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                                            <span>Copied!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3 h-3" />
                                                            <span>Copy</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            <p className="font-mono text-xs bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700/80 p-2.5 rounded-lg select-all break-all text-gray-800 dark:text-gray-200">
                                                {payment.value}
                                            </p>

                                            {payment.value.startsWith("http") && (
                                                <a
                                                    href={payment.value}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-[var(--user-primary)] text-white text-xs font-semibold transition-opacity hover:opacity-90"
                                                >
                                                    <span>Open {platformName}</span>
                                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                                </a>
                                            )}

                                            {payment.qrCodeUrl && (
                                                <div className="flex justify-center pt-2">
                                                    <img
                                                        src={payment.qrCodeUrl}
                                                        alt={`${platformName} QR Code`}
                                                        className="w-32 h-32 rounded-lg object-contain bg-white p-1 border border-gray-200"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Linkle Pay UPI Dynamic Modal */}
            {activeUpiPayment && (
                <UpiPayModal
                    upiId={activeUpiPayment.value}
                    displayName={payeeName}
                    userId={userId}
                    onClose={() => setActiveUpiPayment(null)}
                />
            )}
        </div>
    );
}
