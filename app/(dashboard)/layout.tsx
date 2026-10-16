export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col items-start p-6">
      <div className="sidebar">
        <h2>Dashboard</h2>
      </div>
      <div className="content">{children}</div>
    </div>
  );
}
