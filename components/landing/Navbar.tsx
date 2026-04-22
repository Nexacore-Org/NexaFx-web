"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b">
      <div className="flex items-center justify-between px-4 md:px-12 h-16 max-w-[1440px] mx-auto">
        {/* Logo */}
        <Image
          src="/logo.png"
          alt="NexaFX Logo"
          width={110}
          height={36}
          className="object-contain"
        />

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 text-slate-600 font-medium">
          <a href="#solutions" className="hover:text-[#F39A00] cursor-pointer">Solutions</a>
          <a href="#exchange" className="hover:text-[#F39A00] cursor-pointer">Exchange</a>
          <a href="#security" className="hover:text-[#F39A00] cursor-pointer">Security</a>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/sign-in" className="font-semibold">
            Sign In
          </Link>

          <Link
            href="/signup"
            className="bg-[#F39A00] text-white px-5 py-2 rounded-lg font-bold"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex items-center"
        >
          <span className="text-2xl">
            {open ? <X /> : <Menu />}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden px-4 pb-6 pt-2 bg-white rounded-b-2xl shadow-lg">
          <div className="flex flex-col text-center gap-4 text-slate-600 font-medium">
            <a href="#solutions" onClick={() => setOpen(false)}>Solutions</a>
            <a href="#exchange" onClick={() => setOpen(false)}>Exchange</a>
            <a href="#security" onClick={() => setOpen(false)}>Security</a>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <Link
              href="/sign-in"
              className="text-center font-semibold py-2 border rounded-lg"
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="text-center bg-[#F39A00] text-white py-2 rounded-lg font-bold"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}