import { Suspense } from "react";
import type { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Set a New Password | Linkle",
  description: "Reset your Linkle account password securely.",
  robots: {
    index: false,
    follow: false,
  },
};

function ResetPasswordFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-3">
      <Loader2 className="w-6 h-6 animate-spin text-brand-600 dark:text-brand-400" />
      <p className="text-xs text-gray-500">Verifying reset token...</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a new password of at least 8 characters for your Linkle account."
    >
      <Suspense fallback={<ResetPasswordFallback />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
