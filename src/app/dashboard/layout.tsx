import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobilePreview from "@/components/dashboard/MobilePreview";
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
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <PreviewProvider initialUser={user}>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex">
      <DashboardSidebar user={session.user} />
      <div className="flex-1 flex flex-col lg:flex-row min-h-screen relative">
        <main className="flex-1 p-6 md:p-10 pb-24">
          {children}
        </main>
        
        {/* Right Preview Panel */}
        <aside className="w-[450px] hidden xl:flex flex-col border-l border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50">
          <div className="flex-1 sticky top-0 h-screen overflow-y-auto no-scrollbar py-10 px-8 flex justify-center">
            <MobilePreview />
          </div>
        </aside>
      </div>
    </div>
    </PreviewProvider>
  );
}
