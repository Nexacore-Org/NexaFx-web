import { Sidebar } from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-full w-full">
      <Sidebar />

      <div className="flex min-h-full flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  )
}
