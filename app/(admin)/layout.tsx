export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col items-start p-6">
      <div className="sidebar">
        <h2>Admin</h2>
      </div>
      <main id="main-content" className="content flex-1">
        {children}
      </main>
    </div>
  );
}
