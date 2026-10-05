"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, Loader2, X } from "lucide-react";
import { signOut } from "next-auth/react";

interface DangerZoneSectionProps {
  hasActiveSubscription: boolean;
}

export function DangerZoneSection({ hasActiveSubscription }: DangerZoneSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const isConfirmed = confirmText.trim().toLowerCase() === "delete my account";

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch("/api/user/settings", {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete account");
      }

      // Successfully deleted, log out and redirect to home
      await signOut({ callbackUrl: "/" });
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete account. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-red-200 dark:border-red-950/60 bg-red-50/30 dark:bg-red-950/10 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Danger Zone
            </h2>
            <p className="text-xs text-red-600/90 dark:text-red-400/80 leading-relaxed max-w-lg">
              Permanently delete your Linkle profile, all link blocks, custom appearances, and historical analytics. This action cannot be reversed.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-zinc-900 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold shadow-sm transition-colors text-center"
          >
            Delete account
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950/50">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Delete your account?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setConfirmText("");
                  setDeleteError("");
                }}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-2 leading-relaxed">
              <p>
                This will immediately and permanently erase your account, all links, payment buttons, and collected analytics.
              </p>
              {hasActiveSubscription ? (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300">
                  <strong>Active Subscription Notice:</strong> Your active Stripe subscription will be automatically canceled immediately upon account deletion to ensure you are never billed again.
                </div>
              ) : null}
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                To confirm, type <strong className="text-red-600 dark:text-red-400 select-all font-mono">delete my account</strong> below:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="delete my account"
                className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm font-mono text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
              />
            </div>

            {deleteError && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                {deleteError}
              </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setConfirmText("");
                  setDeleteError("");
                }}
                disabled={deleting}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!isConfirmed || deleting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Permanently delete account</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
