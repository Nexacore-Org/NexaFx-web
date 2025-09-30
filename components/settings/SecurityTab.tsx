"use client";

import { DeleteBLackIcon, DeleteIcon } from "@/public/svg";

// Reusable Gradient Border Button
function GradientButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="relative inline-flex items-center justify-center px-4 py-2 rounded-md whitespace-nowrap">
      <span className="absolute inset-0 rounded-md p-[1px] bg-gradient-to-r from-[#FFA200] via-pink-500 to-[#3B82F6]">
        <span className="block h-full w-full rounded-md bg-white dark:bg-gray-900"></span>
      </span>
      <span className="relative text-xs font-semibold text-gray-700">
        {children}
      </span>
    </button>
  );
}

// Reusable Row Component
function SettingsRow({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center">
      <div className=" pb-2">
        <h3 className="font-medium text-base">{title}</h3>
        <p className="text-xs text-gray-500 w-[210px] md:w-auto">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

export default function SecurityTab() {
  return (
    <div className="space-y-4">
      {/* General Settings Section */}
      <div className="space-y-6 border border-gray-200 p-4 rounded-md">
        <h1 className="text-gray-500 font-semibold border-b pb-4">General</h1>

        <SettingsRow
          title="Session Activity Logs"
          description="View active sessions and login history"
          action={<GradientButton>View Logs</GradientButton>}
        />

        <SettingsRow
          title="Device Logged in"
          description="Manage your connected devices"
          action={<GradientButton>Manage</GradientButton>}
        />

        <SettingsRow
          title="Log out all device"
          description="Force logout on all devices"
          action={
            <button className="cursor-pointer border py-1 px-2 flex items-center gap-1 text-xs font-semibold rounded">
              <DeleteBLackIcon />
              Log out
            </button>
          }
        />

        <SettingsRow
          title="Delete My Account"
          description="Permanently remove your account and data"
          action={
            <button className="cursor-pointer bg-red-500 text-white py-1 px-2 flex items-center gap-1 text-xs font-semibold rounded">
              <DeleteIcon />
              Delete
            </button>
          }
        />
      </div>

      {/* Desktop Footer (visible from sm and up) */}
      <div className="hidden sm:flex space-x-4 mt-6 justify-end text-sm">
        <button className="bg-yellow-500 px-6 py-2 rounded">
          Save Changes
        </button>
        <button className="border px-6 py-2 rounded">Cancel</button>
      </div>

      {/* Mobile Sticky Footer (only visible on xs screens) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 text-sm font-semibold p-3">
        <button className="bg-yellow-500 px-6 py-3 rounded w-full">
          Save Changes
        </button>
      </div>
    </div>
  );
}
