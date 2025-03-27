import { Button } from "@/components/ui/button";
import Image from "next/image";
import WhyChooseUs from "./components/WhyChooseUs";
import Hero from "./components/Hero";
import HowItWorkSectiion from "./components/HowItWorkSectiion";
export default function Home() {
  return (
    <div className="w-full">
      <Hero />
      <WhyChooseUs />
      <HowItWorkSectiion />
    </div>
  );
}
