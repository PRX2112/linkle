"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, ShieldAlert, Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";

interface User {
  id: string;
  email: string | null;
  username: string | null;
  displayName: string | null;
  createdAt: Date | string;
}

export default function SettingsForm({ user }: { user: User }) {
  const router = useRouter();
  const [username, setUsername] = useState(user.username || "");
  const [displayName, setDisplayName] = useState(user.displayName || "");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);

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
        throw new Error(data.error || "Failed to save settings");
      }

      setSuccess("Profile settings successfully updated!");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== "delete my account") {
      setError("Please type 'delete my account' to confirm deletion.");
      return;
    }

    setSuccess("");
    setError("");
    setDeleting(true);

    try {
      const res = await fetch("/api/user/settings", {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete account");
      }

      // Log out user and redirect to home
      await signOut({ callbackUrl: "/" });
    } catch (err: any) {
      setError(err.message || "Failed to delete your account.");
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {success && (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm flex items-center gap-2.5 animate-in fade-in duration-300">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2.5 animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Username */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Profile Username</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
            Your unique URL slug that visitors use to access your profile.
          </p>

          <div className="space-y-4">
            <div className="flex items-center rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-850 overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/40 focus-within:border-transparent transition-all">
              <span className="px-4 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-sm font-medium border-r border-gray-200 dark:border-zinc-700">
                linkle.me/p/
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                placeholder="your-username"
                className="flex-1 px-4 py-3 bg-transparent text-sm text-foreground placeholder-gray-400 focus:outline-none"
              />
            </div>
            <p className="text-xs text-gray-400">
              Only lowercase letters, numbers, hyphens (-) and underscores (_) are allowed (3-20 chars).
            </p>
          </div>
        </div>

        {/* Display Name */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Display Name</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
            The headline name shown on top of your public profile page.
          </p>

          <div>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Creator"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
            />
          </div>
        </div>

        {/* Info & Save Button */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
          <p className="text-xs text-gray-400">
            Account Email: <strong className="text-gray-600 dark:text-gray-300">{user.email}</strong> • Joined: {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl gradient-bg text-white text-sm font-bold hover:opacity-90 transition-all shadow-glow disabled:opacity-50"
          >
            {loading ? "Saving Changes..." : "Save Settings"}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-red-200 dark:border-red-950 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mt-8">
        <h2 className="text-base font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
          Irreversible actions related to your user account. Please proceed with caution.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-5 py-3 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
          >
            Delete Account
          </button>
        ) : (
          <div className="p-5 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex gap-2.5 text-red-700 dark:text-red-400 text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Are you absolutely sure you want to delete your account?</p>
                <p className="mt-1 text-xs opacity-90">This will immediately and permanently erase your user profile, all payment and social link blocks, and historical real-time analytics data. This operation cannot be undone.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">
                To confirm, type <strong className="text-red-600 dark:text-red-400 select-all">delete my account</strong> below:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="delete my account"
                className="w-full max-w-md px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900 bg-white dark:bg-zinc-950 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText.toLowerCase() !== "delete my account"}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-900/30 text-white text-sm font-bold transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Deleting account..." : "Permanently Delete"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-zinc-900 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
