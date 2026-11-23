"use client";

import { useState } from "react";
import { ProductInfo, UserTheme } from "@/lib/types";
import {
  Download,
  ShoppingBag,
  Heart,
  Sparkles,
  CreditCard,
  X,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface ProductsSectionProps {
  products?: ProductInfo[];
  theme: UserTheme;
  displayName?: string;
  username?: string;
  userId?: string;
}

export default function ProductsSection({
  products,
  theme,
  displayName,
  username,
  userId,
}: ProductsSectionProps) {
  const activeProducts = (products || []).filter((p) => p.isActive);
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  if (activeProducts.length === 0) return null;

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

  const formatPrice = (cents: number, currency: string = "USD") => {
    const symbolMap: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
      CAD: "CA$",
      AUD: "AU$",
    };
    const symbol = symbolMap[currency.toUpperCase()] || `${currency.toUpperCase()} `;
    const amount = (cents / 100).toFixed(2);
    return `${symbol}${amount}`;
  };

  const handleStartCheckout = async (product: ProductInfo) => {
    setSelectedProduct(product);
    setCheckoutError("");
  };

  const handleConfirmCheckout = async () => {
    if (!selectedProduct) return;
    setCheckoutLoading(true);
    setCheckoutError("");

    try {
      const res = await fetch("/api/products/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProduct.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize Stripe checkout.");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Missing checkout destination URL.");
      }
    } catch (err: any) {
      setCheckoutError(err.message || "Failed to start checkout. Please try again.");
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg px-4 mt-6 space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-2 px-1">
        <ShoppingBag className="w-4 h-4 text-[var(--user-primary)]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Products & Offers
        </h3>
      </div>

      {/* Product Cards List */}
      <div className="space-y-3">
        {activeProducts.map((product) => {
          const isDigital = product.type === "DIGITAL_FILE";
          const isTip = product.type === "TIP";

          return (
            <div
              key={product.id}
              onClick={() => handleStartCheckout(product)}
              className={`w-full p-4 flex flex-col justify-between gap-3 border transition-all duration-200 cursor-pointer active:scale-[0.99] group ${radiusClass} ${
                isOutline
                  ? "border-2 border-[var(--user-primary)]/40 hover:border-[var(--user-primary)] bg-transparent hover:bg-[var(--user-primary)]/5"
                  : "bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-[var(--user-primary)]/60 shadow-xs hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--user-primary)]/10 text-[var(--user-primary)] flex items-center gap-1 shrink-0">
                      {isDigital ? (
                        <>
                          <Download className="w-3 h-3" />
                          <span>Digital File</span>
                        </>
                      ) : isTip ? (
                        <>
                          <Heart className="w-3 h-3" />
                          <span>Tip / Support</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          <span>Flat Offer</span>
                        </>
                      )}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-[var(--user-primary)] transition-colors leading-snug">
                    {product.title}
                  </h4>

                  {product.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white block font-mono">
                    {formatPrice(product.priceInCents, product.currency)}
                  </span>
                </div>
              </div>

              {/* Purchase Action Trigger Bar */}
              <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-zinc-800/80 text-xs">
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  Instant card checkout
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-[var(--user-primary)] group-hover:underline">
                  <span>{isTip ? "Send Tip" : "Get It Now"}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto styled-scrollbar">
            <div
              className="absolute inset-0"
              onClick={() => {
                if (!checkoutLoading) setSelectedProduct(null);
              }}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative z-10 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-5 sm:p-6 w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto styled-scrollbar border border-gray-200 dark:border-zinc-800 text-left my-auto space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--user-primary)]">
                    Direct Checkout
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                    {selectedProduct.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  disabled={checkoutLoading}
                  className="min-w-[36px] min-h-[36px] p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center -mr-1 -mt-1 shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedProduct.description && (
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-zinc-850 p-3 rounded-xl border border-gray-100 dark:border-zinc-800">
                  {selectedProduct.description}
                </p>
              )}

              {/* Price Details */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-700">
                <div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Seller
                  </span>
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {displayName || username || "Creator"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Total Due
                  </span>
                  <span className="text-base font-extrabold font-mono text-gray-900 dark:text-white">
                    {formatPrice(selectedProduct.priceInCents, selectedProduct.currency)}
                  </span>
                </div>
              </div>

              {checkoutError && (
                <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900/50">
                  {checkoutError}
                </p>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleConfirmCheckout}
                disabled={checkoutLoading}
                className="w-full py-3 px-4 rounded-xl bg-[var(--user-primary)] text-white font-bold text-sm shadow-sm transition-opacity hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Stripe...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay with Card (Stripe)</span>
                  </>
                )}
              </button>

              <div className="text-center text-[10px] text-gray-400 dark:text-gray-500">
                Encrypted 256-bit payment processed securely via Stripe.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

