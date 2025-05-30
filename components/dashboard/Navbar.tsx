// components/Navbar.tsx
"use client";

import { Menu, ChevronLeft } from "lucide-react";
import { useSidebarStore } from "@/store/sidebarStore";
import Image from "next/image";

export default function Navbar() {
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
                isCollapsed ? "max-w-fit" : "md:w-[265px]"
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

          {/* Right side content */}
          <div className="flex items-center">
            <div className="flex items-center ml-3">
              {/* Search bar */}
              <div className="hidden lg:block">
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-10 py-2"
                />
              </div>

              {/* User menu */}
              <div className="flex items-center ml-4">
                <button className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">JD</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
