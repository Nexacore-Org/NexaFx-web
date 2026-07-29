"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/use-auth-store";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  if (user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#A0C3FD]/10 to-[#FFE79C]/10 text-[#191c1e]">
      <Navbar />
      <div className="pt-24">
        <Hero />
        <Features />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}
