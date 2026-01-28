"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountIcon, SecurityIcon, IdentityIcon } from "../icons";
import { AccountInfo } from "./account-info";
import { Security } from "./security";
import { Notification } from "./notification";

export function TabsSettings() {
  const [isActiveTap, setIsActiveTap] = useState<undefined | string>();

  return (
    <Tabs
      defaultValue="account"
      onValueChange={(tap) => {
        setIsActiveTap(tap);
      }}
    >
      <TabsList variant="line" className="gap-1 sm:gap-2 mb-7.5 sm:mb-9">
        <TabsTrigger value="account">
          <AccountIcon
            color={isActiveTap === "account" ? "#000" : ""}
            className="size-3.5"
          />
          Account Info
        </TabsTrigger>
        <TabsTrigger value="security">
          <SecurityIcon
            color={isActiveTap === "security" ? "#000" : ""}
            className="size-3.5"
          />
          Security
        </TabsTrigger>
        <TabsTrigger value="notification">
          <SecurityIcon
            color={isActiveTap === "notification" ? "#000" : ""}
            className="size-3.5"
          />
          Notification
        </TabsTrigger>
        <TabsTrigger value="identity">
          <IdentityIcon
            color={isActiveTap === "identity" ? "#000" : ""}
            className="size-3.5"
          />
          Identity Verification
        </TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <AccountInfo />
      </TabsContent>
      <TabsContent value="security">
        <Security />
      </TabsContent>
      <TabsContent value="notification">
        <Notification />
      </TabsContent>
      <TabsContent value="identity">nothing</TabsContent>
    </Tabs>
  );
}
