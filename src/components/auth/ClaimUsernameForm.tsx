"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AuthError } from "./AuthError";
import { Button } from "@/components/ui/Button";
import { Sparkles, Check, AtSign } from "lucide-react";

export function ClaimUsernameForm() {
  const router = useRouter();
  const { update } = useSession();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }
    if (cleanUsername.length > 20) {
      setError("Username cannot exceed 20 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/claim-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to claim username");
      }

      // Refresh session with new username
      if (typeof update === "function") {
        await update({ username: data.username });
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Alert */}
      <AuthError message={error} />

      <div>
        <label
          htmlFor="claim-username"
          className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5"
        >
          Choose your public username
        </label>
        <div className="flex items-center h-11 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
          <span className="px-3 text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/80 border-r border-gray-200 dark:border-zinc-700 h-full flex items-center shrink-0">
            {process.env.NEXT_PUBLIC_APP_URL}/p/
          </span>
          <input
            id="claim-username"
            name="username"
            type="text"
            required
            autoFocus
            autoComplete="off"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="yourname"
            disabled={loading}
            maxLength={20}
            className="flex-1 h-full px-3 text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 font-mono focus:outline-none"
          />
        </div>
        <p className="mt-1.5 text-[11px] text-gray-500 dark:text-zinc-400">
          3-20 characters. Use lowercase letters, numbers, hyphens, or underscores.
        </p>
      </div>

      {cleanUsername.length >= 3 && (
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-850 border border-gray-200/80 dark:border-zinc-800 text-xs flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">Your profile URL will be:</span>
          <span className="font-mono font-semibold text-brand-600 dark:text-brand-400 truncate max-w-[180px]">
            /p/{cleanUsername}
          </span>
        </div>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          isLoading={loading}
          disabled={cleanUsername.length < 3 || loading}
          className="w-full text-sm font-semibold rounded-xl gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? "Claiming username..." : "Claim Username & Continue"}</span>
        </Button>
      </div>
    </form>
  );
}

