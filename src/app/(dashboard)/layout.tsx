import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar, MobileHeader } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="h-full p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
