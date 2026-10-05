import { Suspense } from "react";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in | Linkle",
  description: "Sign in to your Linkle account to manage your profile, links, and payments.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your Linkle profile and track your visitor analytics."
    >
      <Suspense fallback={<div className="h-48 flex items-center justify-center text-xs text-gray-400">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
