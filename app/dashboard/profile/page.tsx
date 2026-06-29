<<<<<<< HEAD
"use client";

import { ProfileOverview } from "@/components/profile/profile-overview";
import { PersonalInfo } from "@/components/profile/personal-info";
import { VerificationBanner } from "@/components/profile/verification-banner";
import { FAQSection } from "@/components/profile/faq-section";
import { SettingsTabs } from "@/components/profile/settings-tabs";

export default function ProfilePage() {
  return (
    <div className="max-w-350 mx-auto py-6 space-y-8">
      {/* Page Header */}
      <div className="w-full font-bold bg-card inline-block px-4 py-2 rounded-lg shadow-sm border border-border/50">
        <h1 className="text-2xl ">Settings</h1>
      </div>

      {/* Tabs */}
      <SettingsTabs />

      {/* Identity Verification Header */}

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Left Column: Profile Card */}
        <div className="h-full">
          <ProfileOverview />
        </div>

        {/* Right Column: Content Stack */}
        <div className="space-y-6">
          <PersonalInfo />
          <VerificationBanner />
        </div>
      </div>

      {/* Full Width FAQ Section */}
      <div className="w-full">
        <FAQSection />
=======
// app/(dashboard)/page.tsx
"use client";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Welcome back!</p>
>>>>>>> 3042a2a (feat: worked on dashboard sidebar and navbar)
      </div>
    </div>
  );
}
