"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountIcon, SecurityIcon } from "../icons";
import { ProfileTab } from "./profile-tab";
import { Security } from "./security";
import { DangerZone } from "./danger-zone";
import { AlertTriangle } from "lucide-react";

export function TabsSettings() {
  const [activeTab, setActiveTab] = useState<string | undefined>();

  return (
    <Tabs
      defaultValue="profile"
      onValueChange={(tab) => setActiveTab(tab)}
    >
      <TabsList variant="line" className="gap-1 sm:gap-2 mb-7.5 sm:mb-9">
        <TabsTrigger value="profile">
          <AccountIcon
            color={activeTab === "profile" ? "#000" : ""}
            className="size-3.5"
          />
          Profile
        </TabsTrigger>
        <TabsTrigger value="security">
          <SecurityIcon
            color={activeTab === "security" ? "#000" : ""}
            className="size-3.5"
          />
          Security
        </TabsTrigger>
        <TabsTrigger value="danger">
          <AlertTriangle
            className="size-3.5"
            color={activeTab === "danger" ? "#E90004" : undefined}
            aria-hidden="true"
          />
          Danger Zone
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileTab />
      </TabsContent>
      <TabsContent value="security">
        <Security />
      </TabsContent>
      <TabsContent value="danger">
        <DangerZone />
      </TabsContent>
    </Tabs>
  );
}
