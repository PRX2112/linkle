import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import SettingsForm from "@/components/dashboard/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      username: true,
      displayName: true,
      createdAt: true,
      password: true,
      accounts: {
        select: { provider: true },
      },
      subscription: {
        select: { status: true, plan: true },
      },
    },
  });

  if (!user) redirect("/login");

  const hasActiveSubscription = Boolean(
    user.subscription &&
      ["active", "trialing", "past_due"].includes(user.subscription.status)
  );

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your Linkle account and preferences.
        </p>
      </div>

      <SettingsForm
        user={{
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          createdAt: user.createdAt,
          emailVerified: Boolean(user.emailVerified),
          hasPassword: Boolean(user.password),
          providers: user.accounts.map((a) => a.provider),
          hasActiveSubscription,
        }}
      />
    </div>
  );
}
