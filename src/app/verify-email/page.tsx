"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const statusParam = searchParams.get("status");

  const [loading, setLoading] = useState(Boolean(token && email));
  const [success, setSuccess] = useState(statusParam === "success");
  const [error, setError] = useState(statusParam === "expired" ? "This verification link has expired." : "");
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (token && email && !success && !error) {
      fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setSuccess(true);
          } else {
            setError(data.error || "Failed to verify email.");
          }
        })
        .catch(() => {
          setError("Network error. Please try again.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [token, email, success, error]);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendSent(true);
    } catch {
      // Ignore
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
              <Image src="/logo.png" alt="Linkle Logo" width={40} height={40} className="object-contain" priority />
            </div>
            <span className="font-bold text-3xl tracking-tighter gradient-text">Linkle.</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-foreground">Email Verification</h1>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl text-center">
          {loading ? (
            <div className="py-8 flex flex-col items-center gap-4">
              <RefreshCw className="w-10 h-10 text-purple-600 animate-spin" />
              <p className="text-gray-500 dark:text-gray-400">Verifying your email address...</p>
            </div>
          ) : success ? (
            <div className="py-4">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Email Verified!</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Your email address has been verified successfully. Your account is fully secured.
              </p>
              <Link
                href="/dashboard"
                className="block w-full py-3.5 rounded-xl gradient-bg text-white font-semibold shadow-glow hover:opacity-95 transition-all"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="py-4">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Verification Failed</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                {error || "This verification link is invalid or has expired."}
              </p>

              {email && (
                <div className="mb-4">
                  {resendSent ? (
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      A new verification link has been sent to your email.
                    </p>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={resending}
                      className="text-sm font-semibold text-purple-600 hover:text-purple-500 transition-colors disabled:opacity-50"
                    >
                      {resending ? "Sending..." : "Resend verification email"}
                    </button>
                  )}
                </div>
              )}

              <Link
                href="/login"
                className="block w-full py-3 rounded-xl border border-gray-200 dark:border-zinc-700 text-foreground font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all text-sm"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
