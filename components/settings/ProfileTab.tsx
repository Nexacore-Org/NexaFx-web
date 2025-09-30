"use client";

import { useProfileSettings, useUpdateProfile } from "@/hooks/useSettings";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ProfileTab() {
  const { data, isLoading } = useProfileSettings();
  const updateProfile = useUpdateProfile();

  const [language, setLanguage] = useState("English");
  const [fiat, setFiat] = useState("NGN");

  if (isLoading) return <p>Loading...</p>;

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ language, fiat });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{data?.username || "User"}</h2>
          <p className="text-sm text-gray-500">
            Wallet address: {data?.wallet || "0xAbc...123"}
          </p>
        </div>
        <span className="px-3 py-1 border rounded-full text-sm">
          {data?.idVerified ? "Verified ID" : "Unverified ID"}
        </span>
      </div>

      {/* Email */}
      <div>
        <h3 className="font-medium">Email Address</h3>
        <p className="text-gray-500">{data?.email || "a***@yahoo.com"}</p>
      </div>

      {/* Phone */}
      <div>
        <h3 className="font-medium">Phone Number</h3>
        <button className="px-4 py-2 border rounded">Verify</button>
        {/* TODO: Integrate phone verification API */}
      </div>

      {/* Language */}
      <div>
        <h3 className="font-medium">Language</h3>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option>English</option>
          <option>French</option>
        </select>
      </div>

      {/* Fiat */}
      <div>
        <h3 className="font-medium">Fiat Display</h3>
        <div className="space-x-4">
          <label>
            <input
              type="radio"
              value="NGN"
              checked={fiat === "NGN"}
              onChange={() => setFiat("NGN")}
            />
            NGN
          </label>
          <label>
            <input
              type="radio"
              value="USDT"
              checked={fiat === "USDT"}
              onChange={() => setFiat("USDT")}
            />
            USDT
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-4">
        <button
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="bg-yellow-500 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          Save Changes
        </button>
        <button className="border px-6 py-2 rounded">Cancel</button>
      </div>
    </div>
  );
}
