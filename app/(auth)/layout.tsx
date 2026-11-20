export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      id="main-content"
      className="flex min-h-full flex-col items-center justify-center p-6"
    >
      {children}
    </main>
  );
}
