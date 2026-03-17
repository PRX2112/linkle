import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your account and profile settings.</p>
      </div>

      <div className="space-y-4">
        {/* Username */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Username</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Your public profile is at <strong>linkle.me/{user.username ?? "you"}</strong></p>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-500 dark:text-gray-400">
              linkle.me/
            </span>
            <input
              defaultValue={user.username ?? ""}
              placeholder="your-username"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">Member since</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Account Status</span>
              <span className="px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold">Active</span>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">SEO & Meta</h2>
          <p className="text-xs text-gray-400 mb-4">Control how your page appears in search engines and social shares.</p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">SEO Title</label>
              <input placeholder={`${user.displayName ?? user.name ?? "My"}'s Linkle`}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Meta Description</label>
              <textarea rows={2} placeholder="A short description that appears in Google search results..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none" />
            </div>
          </div>
          <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400 text-xs">
            🚧 SEO settings persistence coming soon. Changes here are not saved yet.
          </div>
        </div>

        {/* Danger */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-red-100 dark:border-red-900/30 p-6">
          <h2 className="text-base font-semibold text-red-600 dark:text-red-400 mb-1">Danger Zone</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">These actions are permanent and cannot be undone.</p>
          <button className="px-4 py-2 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
