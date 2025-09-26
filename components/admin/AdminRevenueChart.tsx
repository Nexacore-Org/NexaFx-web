"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MonthlyRevenueData {
  month: string;
  amount: number;
  highlighted?: boolean;
}

function ChartSkeleton() {
  return (
    <div className="h-64 animate-pulse">
      <div className="flex items-end justify-between h-full space-x-1 mb-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center w-full">
            <div
              className="w-full bg-gray-300 rounded-t-sm mb-2"
              style={{ height: `${Math.random() * 150 + 50}px` }}
            ></div>
            <div className="w-6 h-3 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminRevenueChart() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("This month");

  React.useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const monthlyRevenue: MonthlyRevenueData[] = [
    { month: 'Jan', amount: 45000 },
    { month: 'Feb', amount: 52000 },
    { month: 'Mar', amount: 48000 },
    { month: 'Apr', amount: 61000 },
    { month: 'May', amount: 55000, highlighted: true },
    { month: 'Jun', amount: 47000 },
    { month: 'Jul', amount: 53000 },
    { month: 'Aug', amount: 49000 },
    { month: 'Sep', amount: 58000 },
    { month: 'Oct', amount: 62000 },
    { month: 'Nov', amount: 59000 },
    { month: 'Dec', amount: 65000 },
  ];

  const maxAmount = Math.max(...monthlyRevenue.map(d => d.amount));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  const getBarHeight = (amount: number, isMobile: boolean = false) => {
    const maxHeight = isMobile ? 160 : 180; // Slightly shorter on mobile
    return (amount / maxAmount) * maxHeight;
  };

  const yAxisLabels = [30000, 50000, 70000, 90000];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 md:mb-12">
        <h3 className="text-base md:text-lg font-semibold text-gray-900">Revenue</h3>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-2 text-sm text-gray-500 border border-gray-100 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1 rounded">
            {selectedPeriod}
            <ChevronDown className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem 
              onClick={() => setSelectedPeriod("This month")}
              className="cursor-pointer"
            >
              This month
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSelectedPeriod("This year")}
              className="cursor-pointer"
            >
              This year
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSelectedPeriod("This week")}
              className="cursor-pointer"
            >
              This week
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Chart Area */}
      <div className="h-48 md:h-52 relative">
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <div className="flex h-full">
            {/* Y-axis */}
            <div className="flex flex-col justify-between w-8 md:w-12 h-44 md:h-48 mr-2 md:mr-4 text-xs text-gray-500">
              {yAxisLabels.reverse().map((label) => (
                <div key={label} className="text-right">
                  {label / 1000}k
                </div>
              ))}
            </div>

            {/* Chart bars container */}
            <div className="flex-1 relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {yAxisLabels.map((_, index) => (
                  <div
                    key={index}
                    className="border-t border-gray-100"
                    style={{ borderStyle: 'dashed' }}
                  ></div>
                ))}
              </div>

              {/* Bars */}
              <div className="flex items-end justify-between h-44 md:h-48 relative z-10">
                {monthlyRevenue.map((data) => (
                  <div key={data.month} className="flex flex-col items-center flex-1">
                    {/* Bar */}
                    <div
                      className={`w-4 md:w-6 rounded-t-sm transition-all duration-300 hover:opacity-80 ${
                        data.highlighted
                          ? 'bg-bg-contact-orange'
                          : 'bg-gray-300'
                      }`}
                      style={{
                        height: `${getBarHeight(data.amount)}px`,
                        marginBottom: '4px'
                      }}
                      title={`${data.month}: ${formatCurrency(data.amount)}`}
                    ></div>

                    {/* Month label */}
                    <div className="text-xs text-gray-500 mt-1 md:mt-2">
                      {data.month}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}