import React from "react";
import { HeroSkeleton } from "./HeroSkeleton";
import { HowItWorksSkeleton } from "./HowItWorksSkeleton";
import { WhyChooseUsSkeleton } from "./WhyChooseUsSkeleton";

export default function LandingPageSkeleton() {
  return (
    <div>
      <HeroSkeleton />
      <WhyChooseUsSkeleton />
      <HowItWorksSkeleton />
    </div>
  );
}
