"use client";

import NotificationTab from "@/components/settings/Notification";
import ProfileTab from "@/components/settings/ProfileTab";
import SecurityTab from "@/components/settings/SecurityTab";
import { FileIcon, ShieldIcon, BellIcon, IdCardIcon } from "@/public/svg"; // example icons
import { useState } from "react";

const tabs = [
  { key: "profile", label: "Account Info", icon: FileIcon },
  { key: "security", label: "Security", icon: ShieldIcon },
  { key: "notification", label: "Notification", icon: BellIcon },
  { key: "identity", label: "Identity Verification", icon: IdCardIcon },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="max-w-[1086px] md:p-6 p-2 pt-6 md:pt-auto">
      {/* Tabs */}
      <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex space-x-6 border-b text-xs md:text-base border-gray-200 mb-6">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 pb-2 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-yellow-500 text-yellow-600 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {IconComponent && <IconComponent className="w-4 h-4" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "security" && <SecurityTab />}
        {activeTab === "notification" && <NotificationTab />}
        {activeTab === "identity" && (
          <div>
            {/* TODO: Integrate Identity Verification API when available */}
            <p className="text-gray-500">
              Identity Verification UI comming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
