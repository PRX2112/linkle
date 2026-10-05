"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { PasswordField } from "./PasswordField";
import { AuthError } from "./AuthError";
import { OAuthButtons } from "./OAuthButtons";
import { Button } from "@/components/ui/Button";
import { Check, X } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "username" ? value.toLowerCase().replace(/[^a-z0-9_-]/g, "") : value,
    }));
  };

  const isPasswordLongEnough = form.password.length >= 8;
  const doPasswordsMatch = form.password.length > 0 && form.password === form.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isPasswordLongEnough) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please verify both password fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          username: form.username.trim().toLowerCase(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please check your information.");
        return;
      }

      // Auto-login after successful registration
      const loginResult = await signIn("credentials", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });

      if (loginResult?.ok) {
        router.push("/dashboard?onboarding=true");
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch {
      setError("Something went wrong during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        <AuthError message={error} />

        {/* Full Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5"
          >
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Alex Rivera"
            disabled={loading}
            maxLength={50}
            className="w-full h-11 px-3.5 text-sm rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 border border-gray-200 dark:border-zinc-700 transition-colors focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
          />
        </div>

        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5"
          >
            Profile Username
          </label>
          <div className="flex items-center h-11 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
            <span className="px-3 text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/80 border-r border-gray-200 dark:border-zinc-700 h-full flex items-center shrink-0">
              linkle.app/p/
            </span>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              value={form.username}
              onChange={handleChange}
              placeholder="alexrivera"
              disabled={loading}
              minLength={3}
              maxLength={20}
              className="flex-1 h-full px-3 text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1">
            3–20 characters. Lowercase letters, numbers, and dashes.
          </p>
        </div>

        {/* Email Address */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            disabled={loading}
            className="w-full h-11 px-3.5 text-sm rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 border border-gray-200 dark:border-zinc-700 transition-colors focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5"
          >
            Password
          </label>
          <PasswordField
            id="password"
            name="password"
            required
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            disabled={loading}
            minLength={8}
            maxLength={100}
          />
          {form.password.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] mt-1.5">
              {isPasswordLongEnough ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <X className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span className={isPasswordLongEnough ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500"}>
                {isPasswordLongEnough ? "Password meets minimum length" : "At least 8 characters required"}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5"
          >
            Confirm Password
          </label>
          <PasswordField
            id="confirmPassword"
            name="confirmPassword"
            required
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            disabled={loading}
            minLength={8}
            maxLength={100}
          />
          {form.confirmPassword.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] mt-1.5">
              {doPasswordsMatch ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <X className="w-3.5 h-3.5 text-red-500" />
              )}
              <span className={doPasswordsMatch ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>
                {doPasswordsMatch ? "Passwords match" : "Passwords do not match"}
              </span>
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            isLoading={loading}
            className="w-full text-sm font-semibold rounded-xl"
          >
            {loading ? "Creating account..." : "Create free account"}
          </Button>
        </div>

        {/* Legal Text */}
        <p className="text-[11px] text-center text-gray-600 dark:text-gray-400 leading-relaxed px-2">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>

        {/* Google OAuth Option */}
        <OAuthButtons disabled={loading} />
      </form>

      {/* Cross-Link */}
      <div className="mt-6 pt-5 border-t border-gray-100 dark:border-zinc-800 text-center text-xs text-gray-500 dark:text-gray-400">
        Already have an account?{" "}
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
