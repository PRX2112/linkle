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
      capturedEmails: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!user) redirect("/login");

  // Fetch real click event counts grouped by linkId
  const clickCounts = await prisma.clickEvent.groupBy({
    by: ["linkId"],
    where: { userId: session.user.id },
    _count: { id: true },
  });

  const clicksMap = clickCounts.reduce((acc, curr) => {
    acc[curr.linkId] = curr._count.id;
    return acc;
  }, {} as Record<string, number>);

  const userWithClicks = {
    ...user,
    clicksMap,
  };

  return <LinksManager user={userWithClicks as any} />;
}
