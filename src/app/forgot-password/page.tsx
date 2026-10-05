import type { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | Linkle",
  description: "Request a secure password reset link for your Linkle account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter the email address associated with your account and we'll send you a secure reset link."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
