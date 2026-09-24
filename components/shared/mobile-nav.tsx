"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/accounts", label: "Accounts" },
  { href: "/dashboard/convert", label: "Convert" },
  { href: "/dashboard/transfer", label: "Transfer" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
        aria-label="Open navigation menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden",
          isOpen ? "block" : "hidden",
        )}
        onClick={toggleMenu}
      ></div>

      <div
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-background border-r border-border z-50 transform transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">NexaFx</h2>
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Close navigation menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={toggleMenu}
              className="px-4 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
