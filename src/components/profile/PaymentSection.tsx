"use client";

import { PaymentOption, UserTheme } from "@/lib/types";
import { CreditCard, Wallet, Smartphone, DollarSign } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentSectionProps {
    payments: PaymentOption[];
    theme: UserTheme;
}

const iconMap: Record<string, React.ComponentType<any>> = {
    paypal: Wallet,
    stripe: CreditCard,
    upi: Smartphone,
    crypto: DollarSign, // Placeholder for crypto
    paytm: Smartphone,
    phonepe: Smartphone,
    googlepay: Smartphone,
};

export default function PaymentSection({ payments, theme }: PaymentSectionProps) {
    const visiblePayments = (payments || []).filter((p) => p.isVisible);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (visiblePayments.length === 0) return null;

    const buttonRadiusClass = 
        theme.buttonStyle === 'pill' ? 'rounded-2xl' :
        theme.buttonStyle === 'square' ? 'rounded-md' : 'rounded-xl';

    return (
        <div className="w-full max-w-lg px-4 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white px-1 mb-4">
                Pay & Support
            </h2>
            <div className="grid grid-cols-2 gap-3">
                {visiblePayments.map((payment) => {
                    const Icon = iconMap[payment.platform] || DollarSign;
                    const isExpanded = expandedId === payment.id;

                    return (
                        <div key={payment.id} className="relative">
                            <button
                                onClick={() => setExpandedId(isExpanded ? null : payment.id)}
                                data-track-id={payment.id}
                                data-track-type="payment"
                                data-track-title={payment.platform}
                                data-track-url={payment.value}
                                className={`w-full flex flex-col items-center justify-center gap-2 p-4 ${buttonRadiusClass} border transition-all ${isExpanded
                                        ? "bg-blue-50 dark:bg-blue-900/20"
                                        : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"
                                    }`}
                                style={{ 
                                    borderColor: isExpanded ? 'var(--user-primary)' : '',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isExpanded) e.currentTarget.style.borderColor = 'var(--user-primary)';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isExpanded) e.currentTarget.style.borderColor = '';
                                }}
                            >
                                <Icon className={`w-8 h-8 ${isExpanded ? "" : "text-gray-600 dark:text-gray-400"}`} style={{ color: isExpanded ? 'var(--user-primary)' : '' }} />
                                <span className="font-medium capitalize text-sm text-gray-900 dark:text-gray-200">
                                    {payment.platform}
                                </span>
                            </button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 right-0 z-20 mt-2 p-4 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-700 text-center"
                                    >
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                                            {payment.platform} Details
                                        </p>
                                        <p className="font-mono text-sm bg-gray-100 dark:bg-black p-2 rounded select-all break-all">
                                            {payment.value}
                                        </p>
                                        {payment.qrCodeUrl && (
                                            <img src={payment.qrCodeUrl} alt="QR Code" className="w-32 h-32 mx-auto mt-3 rounded-lg" />
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
