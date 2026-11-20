export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main id="main-content" className="flex min-h-full flex-1 flex-col">
      {children}
    </main>
  );
}
