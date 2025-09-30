"use client";

import { useProfileSettings, useUpdateProfile } from "@/hooks/useSettings";
import { useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { useEffect } from "react";

export default function ProfileTab() {
  const { data, isLoading } = useProfileSettings();
  const updateProfile = useUpdateProfile();
  const [language, setLanguage] = useState("English");
  const [selectedFiats, setSelectedFiats] = useState<string[]>(["NGN"]);

  // local loading state with enforced minimum 3s delay
  const [showSkeleton, setShowSkeleton] = useState(true);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ language, fiat: selectedFiats });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleFiatChange = (fiat: string) => {
    setSelectedFiats((prev) =>
      prev.includes(fiat) ? prev.filter((f) => f !== fiat) : [...prev, fiat]
    );
  };

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowSkeleton(false), 3000); // 3s
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading || showSkeleton) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Profile Header Skeleton */}
        <div className="h-[176px] rounded-xl bg-gray-200"></div>

        {/* Email Section Skeleton */}
        <div className="p-4 rounded-lg border bg-white shadow-sm">
          <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>

        {/* Phone Section Skeleton */}
        <div className="p-4 rounded-lg border bg-white shadow-sm">
          <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>

        {/* Preferences Section Skeleton */}
        <div className="p-6 rounded-lg border bg-white shadow-sm">
          <div className="h-7 w-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-5 w-24 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-6"></div>
          <div className="h-5 w-28 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-full bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex justify-end gap-4 pt-4">
          <div className="h-10 w-24 bg-gray-200 rounded"></div>
          <div className="h-10 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative w-full">
      {/* Profile Header */}
      <div className="flex flex-col gap-2 md:gap-0 md:flex-row md:items-center opacity-70 justify-between md:h-[176px] w-full rounded-xl bg-gradient-to-r from-[#FFA200] to-[#3B82F6] p-2 md:p-4  text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="md:w-16 md:h-16 rounded-full bg-white/30 flex items-center justify-center overflow-hidden">
            <Image
              src="/user.png"
              alt="User Avatar"
              width={64}
              height={64}
              className="rounded-full"
            />
          </div>
          <div>
            <h2 className="md:text-2xl font-bold">
              {data?.username || "cerseiload"}
            </h2>
            <p className="text-sm md:text-base opacity-90">
              Wallet: {data?.wallet || "0xAbc...123"}
            </p>
          </div>
        </div>

        <div>
          <button
            className={`px-4 py-1 rounded-full cursor-pointer text-xs md:text-sm font-medium ${
              data?.idVerified ? "bg-green-600" : " border-[#E58600] border"
            }`}
          >
            {data?.idVerified ? "Verified ID" : "Unverified ID"}
          </button>
        </div>
      </div>

      {/* Email Section */}
      <div className="p-2 md:p-4 rounded-lg border bg-white shadow-sm space-y-4">
        <div className="flex justify-between w-full items-center">
          <div>
            <h3 className="font-medium mb-1">Email Address</h3>
            <p className="text-gray-500 max-w-xs text-xs md:text-sm">
              If you need to change your e-mail address, please contact Customer
              Service
            </p>
          </div>
          <p className="text-gray-600 text-xs md:text-sm">
            {data?.email || "a***@yahoo.com"}
          </p>
        </div>

        {/* Phone Section */}
        <div className="flex justify-between w-full items-center">
          <div>
            <h3 className="font-medium">Phone Number</h3>
            <p className="text-gray-500 text-sm">Not linked</p>
          </div>
          <button className="px-4 md:w-[98px] text-white opacity-60 py-2 border text-sm hover:bg-gray-100  bg-gradient-to-r from-[#FFA200] to-[#3B82F6] rounded-full">
            Verify
          </button>
        </div>
      </div>

      {/* Preferences Section - Fixed to match screenshot exactly */}
      <div className="p-2 md:p-4 rounded-lg border bg-white shadow-sm">
        {/* Header */}
        <h2 className="text-base font-semibold text-gray-500 border-b pb-4">
          Preferences
        </h2>

        {/* Language Section - As SELECT dropdown */}
        <div className=" flex items-center justify-between pt-4">
          <div>
            <h3 className="text-sm md:text-lg font-medium text-gray-900">
              Language
            </h3>
            <p className="text-xs md:text-sm text-gray-600 mb-4">
              Select your preferred language
            </p>
          </div>

          {/* Select Dropdown */}
          <div className="w-60">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-3 border text-xs md:text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="English">English</option>
              <option value="French">French</option>
              <option value="Spanish">Spanish</option>
              <option value="German">German</option>
            </select>
          </div>
        </div>

        {/* Fiat Display Section - As CHECKBOXES */}
        <div className="flex items-center justify-between">
          <div className="max-w-md">
            <h3 className="text-sm md:text-lg font-medium text-gray-900 ">
              Fiat Display
            </h3>
            <p className="text-sm hidden md:block text-gray-600 ">
              Lorem ipsum dolor sit amet consectetur. Commodo tellus velit
            </p>
          </div>

          {/* Fiat Options as Checkboxes */}
          <div className="flex gap-2 items-center">
            <label className="flex gap-2 text-sm items-center flex-row-reverse justify-between rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
              <span className="font-medium text-gray-900">NGN</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={selectedFiats.includes("NGN")}
                  onChange={() => handleFiatChange("NGN")}
                  className="sr-only" // Hide the default checkbox
                />
                <div
                  className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-all ${
                    selectedFiats.includes("NGN")
                      ? "border-transparent opacity-70 bg-gradient-to-r from-[#FFA200] to-[#3B82F6]"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {selectedFiats.includes("NGN") && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </label>

            <label className="flex gap-2 text-sm items-center flex-row-reverse justify-between rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
              <span className="font-medium text-gray-900 text-xs md:text-sm">
                USDT/USDC
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={selectedFiats.includes("USDT")}
                  onChange={() => handleFiatChange("USDT")}
                  className="sr-only" // Hide the default checkbox
                />
                <div
                  className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-all ${
                    selectedFiats.includes("USDT")
                      ? "border-transparent opacity-70 bg-gradient-to-r from-[#FFA200] to-[#3B82F6]"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {selectedFiats.includes("USDT") && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Desktop Footer (visible from sm and up) */}
      <div className="hidden sm:flex space-x-4 mt-6 justify-end text-sm">
        <button
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="bg-yellow-500 text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:bg-yellow-600 transition-colors font-medium"
        >
          {updateProfile.isPending ? "Saving..." : "Save Changes"}
        </button>
        <button className="border px-6 py-2 rounded">Cancel</button>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="sm:hidden fixed bottom-0 p-2 left-0 right-0 shadow-lg">
        <button
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="bg-yellow-500 text-sm w-full px-6 py-3 rounded-lg disabled:opacity-50 hover:bg-yellow-600 transition-colors font-medium flex-1"
        >
          {updateProfile.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
