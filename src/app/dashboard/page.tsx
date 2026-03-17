import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import LinksManager from "@/components/dashboard/LinksManager";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      socialLinks: { orderBy: { order: "asc" } },
      businessLinks: { orderBy: { order: "asc" } },
      paymentLinks: { orderBy: { order: "asc" } },
      contactActions: { orderBy: { order: "asc" } },
    },
  });

  if (!user) redirect("/login");

  return <LinksManager user={user} />;
}
