"use client";

import { useState } from "react";
import { Mail, CheckCircle2, ShieldCheck, KeyRound, Loader2, AlertCircle } from "lucide-react";

interface AccountSecuritySectionProps {
  email: string | null;
  emailVerified: boolean;
  hasPassword: boolean;
  providers: string[];
}

export function AccountSecuritySection({
  email,
  emailVerified,
  hasPassword,
  providers,
}: AccountSecuritySectionProps) {
  const [resetRequested, setResetRequested] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");

  const handleRequestPasswordReset = async () => {
    if (!email) return;
    setResetLoading(true);
    setResetMessage("");
    setResetError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch password reset link");
      }

      setResetRequested(true);
      setResetMessage(data.message || "A secure password reset link has been dispatched to your email address.");
    } catch (err: any) {
      setResetError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Security & Authentication</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Review your account sign-in methods, email verification, and credentials.
        </p>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-zinc-800">
        {/* Email Address & Verification */}
        <div className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Email address
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {email || "No email associated"}
            </p>
          </div>
          <div>
            {emailVerified ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-[11px] font-semibold text-green-700 dark:text-green-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                Email not verified
              </span>
            )}
          </div>
        </div>

        {/* Authentication Provider */}
        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Sign-in method
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {providers.includes("google")
                ? "Connected with Google OAuth"
                : hasPassword
                ? "Password authentication"
                : "Credentials sign-in"}
            </p>
          </div>
          <div>
            {providers.includes("google") && (
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded bg-gray-100 dark:bg-zinc-800">
                OAuth Active
              </span>
            )}
          </div>
        </div>

        {/* Password Management */}
        <div className="py-4 last:pb-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Password
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
                {hasPassword
                  ? "Your account is secured with a password. You can request a secure reset link to update it."
                  : "You currently sign in via social provider. You can set a password by requesting a reset link."}
              </p>
            </div>
            <div className="shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleRequestPasswordReset}
                disabled={resetLoading || !email}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-750 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-sm transition-colors disabled:opacity-50"
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending link...</span>
                  </>
                ) : (
                  <span>Send reset link</span>
                )}
              </button>
            </div>
          </div>

          {resetMessage && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{resetMessage}</span>
            </div>
          )}

          {resetError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{resetError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
