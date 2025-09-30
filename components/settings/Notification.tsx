"use client";

import { useState } from "react";

export default function NotificationTab() {
  const [settings, setSettings] = useState({
    inApp: true,
    sms: false,
    email: true,
    transaction: true,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings({ ...settings, [key]: !settings[key] });

  return (
    <div className="space-y-6">
      <div className="space-y-6 border border-gray-200 p-4 rounded-md">
        <h1 className="text-gray-500 font-semibold border-b pb-4">
          Notification Push
        </h1>
        {[
          { key: "inApp", label: "In-app notification" },
          { key: "sms", label: "SMS notification" },
          { key: "email", label: "Email notification" },
          { key: "transaction", label: "Transaction Alert" },
        ].map((item) => (
          <div
            key={item.key}
            className="flex justify-between items-center pb-2"
          >
            <div>
              <h3 className="font-medium">{item.label}</h3>
              <p className="text-sm text-gray-500">
                {/* TODO: Add API integration later */}
                Placeholder description for {item.label}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings[item.key as keyof typeof settings]}
                onChange={() => toggle(item.key as keyof typeof settings)}
                className="sr-only"
              />
              <span
                className={`w-11 h-6 flex items-center rounded-full p-1 ${
                  settings[item.key as keyof typeof settings]
                    ? "bg-yellow-500"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`bg-white w-4 h-4 rounded-full shadow transform duration-300 ${
                    settings[item.key as keyof typeof settings]
                      ? "translate-x-5"
                      : ""
                  }`}
                />
              </span>
            </label>
          </div>
        ))}{" "}
      </div>

      {/* Desktop Footer (visible from sm and up) */}
      <div className="hidden sm:flex space-x-4 mt-6 justify-end text-sm">
        <button className="bg-yellow-500 px-6 py-2 rounded">
          Save Changes
        </button>
        <button className="border px-6 py-2 rounded">Cancel</button>
      </div>

      {/* Mobile Sticky Footer (only visible on xs screens) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
        <button className="bg-yellow-500 px-6 py-3 rounded w-full">
          Save Changes
        </button>
      </div>
    </div>
  );
}
