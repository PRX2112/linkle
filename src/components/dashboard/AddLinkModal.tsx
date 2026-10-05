"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import {
  Share2,
  Globe,
  CreditCard,
  Mail,
  ArrowRight,
  Sparkles,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: "social" | "business" | "payments" | "tools") => void;
  onOpenTemplates?: () => void;
  onOpenImport?: () => void;
}

export function AddLinkModal({
  isOpen,
  onClose,
  onSelectCategory,
  onOpenTemplates,
  onOpenImport,
}: AddLinkModalProps) {
  const options = [
    {
      id: "social" as const,
      title: "Social Profile",
      description: "Connect Instagram, YouTube, LinkedIn, GitHub, X, or email.",
      icon: <Share2 className="w-5 h-5 text-pink-600 dark:text-pink-400" />,
      bg: "bg-pink-50 dark:bg-pink-950/30 border-pink-200/60 dark:border-pink-900/50",
    },
    {
      id: "business" as const,
      title: "Website or Custom Link",
      description: "Showcase your portfolio, product, store, or article with a thumbnail.",
      icon: <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      bg: "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200/60 dark:border-indigo-900/50",
    },
    {
      id: "payments" as const,
      title: "Payment Method",
      description: "Accept payments and tips via UPI, PayPal, Stripe, or Crypto.",
      icon: <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-900/50",
    },
    {
      id: "tools" as const,
      title: "Email Capture & Tools",
      description: "Collect visitor emails into a downloadable subscriber list.",
      icon: <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/50",
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Add Content to Profile"
      description="Choose what type of link or block you want to publish."
    >
      <div className="space-y-4 pt-1">
        {/* Category Cards */}
        <div className="grid grid-cols-1 gap-2.5">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onSelectCategory(opt.id);
                onClose();
              }}
              className="flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-200/80 dark:border-zinc-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 bg-white dark:bg-zinc-900 hover:bg-gray-50/70 dark:hover:bg-zinc-850/60 transition-all text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border",
                  opt.bg
                )}
              >
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  {opt.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 truncate">
                  {opt.description}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>

        {/* Quick Utilities: Templates & Profile Importer */}
        {(onOpenTemplates || onOpenImport) && (
          <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-2 text-xs">
            {onOpenTemplates && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTemplates();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Browse Profile Templates</span>
              </button>
            )}

            {onOpenImport && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenImport();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors font-medium ml-auto"
              >
                <Download className="w-3.5 h-3.5 text-purple-500" />
                <span>Import Existing URLs</span>
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
