"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { PasswordField } from "./PasswordField";
import { AuthError } from "./AuthError";
import { Button } from "@/components/ui/Button";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);

  // If token parameter is completely missing from URL
  if (!token) {
    return (
      <div className="text-center space-y-4 py-2">
        <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Missing Reset Token
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
            This password reset link is invalid or incomplete. Please request a new link to reset your password.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="w-full h-11 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center transition-colors shadow-xs"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  // If the backend confirmed the token was expired or invalid
  if (isTokenInvalid) {
    return (
      <div className="text-center space-y-4 py-2">
        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Reset Link Expired or Invalid
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
            This password reset link is no longer valid. It may have expired or already been used.
          </p>
        </div>
        <div className="pt-2 space-y-2">
          <Link
            href="/forgot-password"
            className="w-full h-11 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center transition-colors shadow-xs"
          >
            Request a new reset link
          </Link>
          <Link
            href="/login"
            className="block text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white pt-1"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  // After successful reset
  if (success) {
    return (
      <div className="text-center space-y-4 py-2">
        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Password Updated
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
            Your password has been changed successfully. You can now sign in with your new credentials.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="w-full h-11 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Sign in now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please ensure both passwords match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (
          res.status === 400 &&
          (data.error?.toLowerCase().includes("invalid") ||
            data.error?.toLowerCase().includes("expired") ||
            data.error?.toLowerCase().includes("used"))
        ) {
          setIsTokenInvalid(true);
          return;
        }
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        <AuthError message={error} />

        {/* New Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5"
          >
            New Password
          </label>
          <PasswordField
            id="password"
            name="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            disabled={loading}
            minLength={8}
            maxLength={100}
          />
        </div>

        {/* Confirm New Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5"
          >
            Confirm New Password
          </label>
          <PasswordField
            id="confirmPassword"
            name="confirmPassword"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            disabled={loading}
            minLength={8}
            maxLength={100}
          />
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            isLoading={loading}
            className="w-full text-sm font-semibold rounded-xl"
          >
            {loading ? "Resetting password..." : "Reset password"}
          </Button>
        </div>
      </form>

      {/* Cross-Link */}
      <div className="mt-6 pt-5 border-t border-gray-100 dark:border-zinc-800 text-center text-xs text-gray-500 dark:text-gray-400">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 underline-offset-2 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
