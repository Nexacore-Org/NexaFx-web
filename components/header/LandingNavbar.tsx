import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";

const LandingNavbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="NexaFX Logo"
              width={120}
              height={40}
              className="h-auto"
            />
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            How It Works
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="#faq"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <div className="rounded-md bg-gradient-to-r from-blue-500 to-yellow-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90">
              Get Started
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default LandingNavbar;
