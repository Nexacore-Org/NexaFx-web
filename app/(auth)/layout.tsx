import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#A0C3FD] to-[#FFE79C] flex flex-col">
      <div className="flex justify-center pt-8 pb-4">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="NexaFX logo"
            width={120}
            height={40}
            priority
          />
        </Link>
      </div>
      <main className="flex-1 flex items-center justify-center px-4 pb-8">
        {children}
      </main>
    </div>
  );
}
