"use client";

import { CreditCard, ExternalLink, Loader2 } from "lucide-react";

interface PaymentMethodSectionProps {
  paymentMethod: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
  onManagePortal: () => void;
  portalLoading: boolean;
}

export function PaymentMethodSection({
  paymentMethod,
  onManagePortal,
  portalLoading,
}: PaymentMethodSectionProps) {
  // If no payment method is registered or user is free, do not render an empty fake card
  if (!paymentMethod) {
    return null;
  }

  const brandFormatted =
    paymentMethod.brand.charAt(0).toUpperCase() + paymentMethod.brand.slice(1);
  const expFormatted = `${String(paymentMethod.expMonth).padStart(2, "0")}/${String(
    paymentMethod.expYear
  ).slice(-2)}`;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-500" />
            Payment Method
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Card on file used for your subscription renewal.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
            <div className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              {brandFormatted}
            </div>
            <div className="text-xs font-mono text-gray-600 dark:text-gray-300">
              •••• {paymentMethod.last4}
            </div>
            <div className="text-[11px] text-gray-400 border-l border-gray-200 dark:border-zinc-700 pl-2">
              Exp {expFormatted}
            </div>
          </div>

          <button
            type="button"
            onClick={onManagePortal}
            disabled={portalLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-750 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors shadow-sm"
          >
            {portalLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>Update</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
