'use client'
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";
import WhyChooseUs from "./components/WhyChooseUs";
import Hero from "./components/Hero";
import HowItWorkSectiion from "./components/HowItWorkSectiion";
import LandingPageSkeleton from "./components/LandingPageSkeleton";

export default function Home() {
const [loading, setLoading]=useState(true)

useEffect(()=>{
  const timer =setTimeout(()=> setLoading(false), 2000)
  return ()=> clearTimeout(timer)
}, [])

  return (

    <div className="w-full">
      {
        loading ? (
          <LandingPageSkeleton/>
        ) :
        <>
        <Hero />
        <WhyChooseUs />    
        <HowItWorkSectiion />

        </>

      }
      
    </div>
  );
}
