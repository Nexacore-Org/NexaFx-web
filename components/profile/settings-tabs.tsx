"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Lock, Bell, User, ShieldCheck } from "lucide-react";
import { WebAuthnSection } from "@/components/settings/webauthn-section";
import { ActiveSessions } from "@/components/settings/active-sessions";
import { VerificationBanner } from "@/components/profile/verification-banner";
import { FAQSection } from "@/components/profile/faq-section";
import { ProfileOverview } from "@/components/profile/profile-overview";
import { PersonalInfo } from "@/components/profile/personal-info";

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState("Identity Verification");

  const tabs = [
    { name: "Account Info", icon: User },
    { name: "Security", icon: Lock },
    { name: "Notification", icon: Bell },
    { name: "Identity Verification", icon: ShieldCheck },
  ];

  return (
    <>
      <div className="border-b border-border/50 mb-8">
        <nav
          className="-mb-px flex space-x-8 overflow-x-auto no-scrollbar"
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={cn(
                "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors",
                activeTab === tab.name
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              <tab.icon
                className={cn(
                  "w-4 h-4",
                  activeTab === tab.name ? "text-primary" : "text-muted-foreground",
                )}
              />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "Account Info" && (
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
          <div className="h-full">
            <ProfileOverview />
          </div>
          <div className="space-y-6">
            <PersonalInfo />
          </div>
        </div>
      )}

      {activeTab === "Security" && (
        <div className="space-y-8">
          <WebAuthnSection />
          <ActiveSessions />
        </div>
      )}

      {activeTab === "Notification" && (
        <div>
          <p>Notification settings will be here.</p>
        </div>
      )}

      {activeTab === "Identity Verification" && (
        <div className="space-y-6">
          <VerificationBanner />
          <FAQSection />
        </div>
      )}
    </>
  );
}