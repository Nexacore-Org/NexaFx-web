import Link from "next/link";
import Image from "next/image";

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-linear-to-tr from-[#FFE79C]  to-[#A0C3FD] flex flex-col items-center">
      {/* Navbar */}
      <header className="w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 mt-4">
        <nav className="bg-card/40 backdrop-blur-md rounded-2xl border border-card/20 px-6 py-4 flex items-center justify-between shadow-sm">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/nexafx 3.png"
              alt="NexaFX Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </Link>
          <div className="flex items-center gap-1 text-sm font-medium">
            <span className="text-zinc-600 hidden md:block">
              Already have an account?
            </span>
            <Link href="/login" className="text-orange-500 hover:underline">
              Log in
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
