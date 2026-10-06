"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Check, ExternalLink, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface AccountProfileSectionProps {
  user: {
    id: string;
    username: string | null;
    displayName: string | null;
    email: string | null;
  };
  onSaveSuccess: () => void;
}

export function AccountProfileSection({
  user,
  onSaveSuccess,
}: AccountProfileSectionProps) {
  const [username, setUsername] = useState(user.username || "");
  const [displayName, setDisplayName] = useState(user.displayName || "");

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [copied, setCopied] = useState(false);

  // Username validation state
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    available: boolean;
    isCurrent?: boolean;
    reason?: string;
  } | null>(null);

  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Canonical profile URL
  const origin = typeof window !== "undefined" ? window.location.origin : "https://linklez.vercel.app";
  const canonicalUrl = `${origin}/p/${username || user.username || ""}`;

  // Check username availability when user stops typing
  useEffect(() => {
    const trimmed = username.trim().toLowerCase();

    if (!trimmed || trimmed === (user.username || "").toLowerCase()) {
      setUsernameStatus(trimmed ? { available: true, isCurrent: true } : null);
      return;
    }

    if (trimmed.length < 3) {
      setUsernameStatus({
        available: false,
        reason: "Username must be at least 3 characters.",
      });
      return;
    }

    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    setCheckingUsername(true);
    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/user/settings?checkUsername=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setUsernameStatus(data);
        } else {
          setUsernameStatus(null);
        }
      } catch {
        setUsernameStatus(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 450);

    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, [username, user.username]);

  const hasUnsavedChanges =
    username.trim().toLowerCase() !== (user.username || "").toLowerCase() ||
    displayName.trim() !== (user.displayName || "");

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess(false);

    if (usernameStatus && !usernameStatus.available && !usernameStatus.isCurrent) {
      setSaveError(usernameStatus.reason || "Please select an available username.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          displayName: displayName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile settings");
      }

      setSaveSuccess(true);
      onSaveSuccess();
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setSaveError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Canonical Profile Link Card */}
      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Your Public Linkle
            </span>
            <div className="text-base font-mono font-medium text-gray-900 dark:text-white mt-1 break-all">
              {canonicalUrl}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  <span className="text-green-600 dark:text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy link</span>
                </>
              )}
            </button>
            <a
              href={`/p/${user.username || username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View profile</span>
            </a>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Profile Identity</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Configure your headline identity and public URL handle.
          </p>
        </div>

        {saveSuccess && (
          <div className="p-3.5 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile settings saved successfully.</span>
          </div>
        )}

        {saveError && (
          <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Display Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Display name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Sarah Connor"
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            The headline name displayed on your public profile header.
          </p>
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Username
          </label>
          <div className="flex items-center rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <span className="px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/80 text-gray-500 dark:text-gray-400 text-xs font-mono font-medium border-r border-gray-200 dark:border-zinc-700 select-none">
              linklez.vercel.app/p/
            </span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
              }
              placeholder="username"
              className="flex-1 px-3.5 py-2.5 bg-transparent text-sm font-mono text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
            />
            {checkingUsername && (
              <span className="pr-3 text-gray-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </span>
            )}
          </div>

          {/* Availability Status */}
          {usernameStatus && (
            <div className="pt-1">
              {usernameStatus.isCurrent ? (
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  Current active username
                </span>
              ) : usernameStatus.available ? (
                <span className="text-[11px] font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Username is available
                </span>
              ) : (
                <span className="text-[11px] font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {usernameStatus.reason || "Username is unavailable"}
                </span>
              )}
            </div>
          )}

          <p className="text-[11px] text-gray-500 dark:text-gray-400 pt-1 leading-relaxed">
            Allowed: lowercase letters, numbers, hyphens (-) and underscores (_) (3-20 characters). When updated, existing profile URLs and QR codes permanently redirect to your new username.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-3">
          <div>
            {hasUnsavedChanges && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Unsaved changes
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={saving || !hasUnsavedChanges || (usernameStatus !== null && !usernameStatus.available && !usernameStatus.isCurrent)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving changes...</span>
              </>
            ) : (
              <span>Save changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
