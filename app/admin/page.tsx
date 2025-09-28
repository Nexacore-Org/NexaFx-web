"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AdminOverviewCards } from "@/components/admin/AdminOverviewCards";
import { AdminRecentTransactions } from "@/components/admin/AdminRecentTransactions";
import { AdminRevenueChart } from "@/components/admin/AdminRevenueChart";
import { AdminDepositWithdrawalSummary } from "@/components/admin/AdminDepositWithdrawalSummary";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("This Year");

  return (
    <div className="px-4 md:px-6 py-6 md:py-8">
        {/* Overview Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Overview</h1>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm hidden md:inline">Show</span>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-2 md:px-3 py-1 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1 rounded-md">
                {selectedPeriod}
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem 
                  onClick={() => setSelectedPeriod("This Year")}
                  className="cursor-pointer"
                >
                  This Year
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSelectedPeriod("This Month")}
                  className="cursor-pointer"
                >
                  This Month
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSelectedPeriod("This Week")}
                  className="cursor-pointer"
                >
                  This Week
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

      {/* Overview Cards */}
      <div className="mb-6 md:mb-8">
        <AdminOverviewCards />
      </div>

        {/* Unified Content Area - Chart, Deposits/Withdrawals, and Transactions */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Top Section - Revenue Chart and Deposits/Withdrawals */}
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 lg:border-r border-gray-200">
              <AdminRevenueChart />
            </div>
            {/* Hide deposit/withdrawal summary on mobile since it's in the gradient card now */}
            <div className="lg:col-span-1 hidden md:block">
              <AdminDepositWithdrawalSummary />
            </div>
          </div>
          
          {/* Bottom Section - Recent Transactions */}
          <div className="border-t border-gray-200">
            <AdminRecentTransactions />
          </div>
        </div>
    </div>
  );
}