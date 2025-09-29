"use client";

import React from "react";
import { PushAnnouncementForm } from "@/components/admin/PushAnnouncementForm";

export default function AdminNotificationsPage() {
  return (
    <div className="px-4 md:px-6 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Push Notifications
        </h1>
        <p className="text-gray-600 mt-2">
          Send announcements and notifications to all users
        </p>
      </div>

      <div className="flex justify-center">
        <PushAnnouncementForm />
      </div>
    </div>
  );
}
