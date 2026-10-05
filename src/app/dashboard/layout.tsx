import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PreviewProvider } from "@/components/dashboard/PreviewContext";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      socialLinks: { orderBy: { order: "asc" } },
      businessLinks: { orderBy: { order: "asc" } },
      paymentLinks: { orderBy: { order: "asc" } },
      contactActions: { orderBy: { order: "asc" } },
      subscription: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <PreviewProvider initialUser={user}>
      <DashboardShell user={user}>{children}</DashboardShell>
    </PreviewProvider>
  );
}
