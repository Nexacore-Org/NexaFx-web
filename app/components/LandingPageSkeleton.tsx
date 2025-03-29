import React from 'react'
import { HeroSkeleton } from './skeletons/HeroSkeleton'
import { HowItWorksSkeleton } from './skeletons/HowItWorksSkeleton'
import { WhyChooseUsSkeleton } from './skeletons/WhyChooseUsSkeleton'

export default function LandingPageSkeleton() {
  return (
    <div>
        <HeroSkeleton/>
        <WhyChooseUsSkeleton/>
        <HowItWorksSkeleton/>   
    </div>
  )
}
