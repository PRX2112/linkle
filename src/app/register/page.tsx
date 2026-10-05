import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create your Linkle | Register",
  description: "Create a free Linkle account in seconds. Build your personal microsite, accept zero-fee UPI payments, and share your links.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <AuthLayout
      title="Create your Linkle"
      subtitle="Build one high-converting profile for your links, work, and contact details."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
