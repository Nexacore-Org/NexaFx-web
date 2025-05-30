// components/Navbar.tsx
"use client";

import { Menu, ChevronLeft, BellDot } from "lucide-react";
import { useSidebarStore } from "@/store/sidebarStore";
import Image from "next/image";
import clsx from "clsx";
import { useState } from "react";

const navItems = ["Dashboard", "Convert"];

export default function Navbar() {
  const [active, setActive] = useState("Dashboard");
  const { isCollapsed, toggleCollapse, toggleMobile } = useSidebarStore();

  return (
    <nav className=" border-b fixed w-full z-50 top-0 h-[82px]">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            {/* Mobile menu button */}
            <button
              onClick={toggleMobile}
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200">
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop collapse button */}
            {/* <button
              onClick={toggleCollapse}
              className="hidden lg:inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200">
              {isCollapsed ? (
                <ChevronRight className="w-6 h-6" />
              ) : (
                <ChevronLeft className="w-6 h-6" />
              )}
            </button>

            <a href="#" className="flex ml-2 md:mr-24">
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap">
                NexaFX
              </span>
            </a> */}
            <div
              className={`flex items-center justify-between p-2.5 ${
                isCollapsed ? "lg:w-20" : "lg:w-60"
              } rounded-full bg-white`}>
              <div className="flex items-center gap-2">
                {!isCollapsed && (
                  <div className="">
                    <Image src="/logo.png" alt="Logo" width={124} height={42} />
                  </div>
                )}
              </div>
              <button
                onClick={toggleCollapse}
                className="p-2 rounded-full hover:bg-gray-100">
                {isCollapsed ? (
                  <div className="">
                    <Image
                      src="/logo-mini.svg"
                      alt="Logo"
                      width={20}
                      height={20}
                    />
                  </div>
                ) : (
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          <nav className="flex items-center justify-between w-full px-10 py-4">
            {/* Left nav items */}
            <div className="flex space-x-6">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => setActive(item)}
                  className={clsx(
                    "relative font-medium text-lg",
                    active === item ? "text-black font-bold" : "text-gray-600",
                    "transition"
                  )}>
                  {item}
                  {active === item && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Search bar */}
            <div className="flex-1 flex justify-center mx-10">
              <input
                type="text"
                placeholder="Search..."
                className="w-full max-w-md px-5 py-2 rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none"
              />
            </div>

            {/* Right icons */}
            <div className="flex items-center space-x-4">
              {/* Notification/Settings Icon */}
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
                <BellDot className="w-5 h-5 text-black" />
                {/* Replace with icon component if needed */}
              </div>

              {/* Avatar */}
              <div className="w-9 h-9 rounded-full overflow-hidden">
                <Image
                  src="/user.png" // Save your avatar image here in /public
                  alt="Avatar"
                  width={36}
                  height={36}
                />
              </div>
            </div>
          </nav>
        </div>
      </div>
    </nav>
  );
}
