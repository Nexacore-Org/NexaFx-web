"use client";
import Hero from "@/components/Landing-page/Hero/Hero";
import HowItWorkSectiion from "@/components/Landing-page/HowItWorkSectiion";
import LandingPageSkeleton from "@/components/skeletons/LandingPageSkeleton";
import WhyChooseUs from "@/components/Landing-page/WhyChooseUs";
import { useState, useEffect } from "react";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full ">
      {loading ? (
        <LandingPageSkeleton />
      ) : (
        <>
          <Hero />
          <WhyChooseUs />
          <HowItWorkSectiion />
        </>
      )}
    </div>
  );
}
