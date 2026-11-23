import { Suspense } from "react";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AuthLayout from "@/components/auth/AuthLayout";
import { ClaimUsernameForm } from "@/components/auth/ClaimUsernameForm";

export const metadata: Metadata = {
  title: "Claim your username | Linkle",
  description: "Choose a unique username for your Linkle profile.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ClaimUsernamePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  });

  // If user already has a username, proceed to dashboard
  if (user?.username) {
    redirect("/dashboard");
  }

  return (
    <AuthLayout
      title="Claim your username"
      subtitle="Finish setting up your Linkle account by choosing your unique personal handle."
    >
      <Suspense fallback={<div className="h-48 flex items-center justify-center text-xs text-gray-400">Loading...</div>}>
        <ClaimUsernameForm />
      </Suspense>
    </AuthLayout>
  );
}

