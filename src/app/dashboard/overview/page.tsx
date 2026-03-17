import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { LayoutDashboard, Link as LinkIcon, MousePointerClick, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function DashboardOverviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      socialLinks: true,
      businessLinks: true,
      paymentLinks: true,
    },
  });

  if (!user) redirect("/login");

  const totalLinks = user.socialLinks.length + user.businessLinks.length + user.paymentLinks.length;

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Welcome back, {user.displayName || user.name || "Creator"} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Here's a quick overview of your Linkle profile.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Links", value: totalLinks, icon: LinkIcon, color: "from-indigo-500 to-purple-600" },
          { label: "Mock Clicks", value: "1,248", icon: MousePointerClick, color: "from-rose-500 to-pink-600" },
          { label: "Profile Views", value: "3,912", icon: TrendingUp, color: "from-emerald-400 to-teal-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="space-y-2">
          {[
            { label: "Manage my links", desc: "Add, edit, reorder your links", href: "/dashboard" },
            { label: "Customize Appearance", desc: "Change theme, fonts, and colors", href: "/dashboard/appearance" },
            { label: "View Analytics", desc: "See clicks and performance", href: "/dashboard/analytics" },
            { label: "View Public Profile", desc: `linkle.me/${user.username ?? "you"}`, href: user.username ? `/p/${user.username}` : "#", external: true },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors group"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
