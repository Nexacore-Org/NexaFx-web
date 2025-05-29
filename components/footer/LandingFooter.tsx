import Link from "next/link";
import Image from "next/image";

const LandingFooter = () => {
  return (
    <footer className="w-full border-t bg-slate-50 py-6 dark:bg-slate-950">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="NexaFX Logo"
            width={100}
            height={100}
            className="h-auto"
          />
          <p className="text-sm text-muted-foreground">
            © 2025 NexaFX. All rights reserved.
          </p>
        </div>
        <nav className="flex gap-4 sm:gap-6">
          <Link
            href="/terms"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Privacy
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default LandingFooter;
