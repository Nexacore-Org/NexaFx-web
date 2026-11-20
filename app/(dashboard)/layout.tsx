import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { BottomNav } from "@/components/dashboard/bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full w-full">
      <Sidebar />

      <div className="flex min-h-full flex-1 flex-col">
        <Topbar />
        <main
          id="main-content"
          className="flex-1 px-4 py-6 pb-20 md:px-6 md:pb-6"
        >
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
