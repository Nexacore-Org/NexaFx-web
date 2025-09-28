"use client";

import React from "react";
import { useAdminTransactions } from "@/hooks/useAdminDashboard";

interface UserTableData {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  addedOn: string;
  isOnline: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index} className="animate-pulse">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
              <div className="h-4 bg-gray-300 rounded w-48"></div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-300 rounded w-20"></div>
          </td>
        </tr>
      ))}
    </>
  );
}

export function AdminRecentTransactions() {
  const { isLoading } = useAdminTransactions(10);

  // Mock data that matches Figma design - replace with real data when API is ready
  const mockUsers: UserTableData[] = [
    {
      id: "1",
      email: "cerrutherford@gmail.com",
      fullName: "Full name",
      phoneNumber: null,
      addedOn: "2025-01-14",
      isOnline: true,
    },
    {
      id: "2",
      email: "cerrutherford@gmail.com",
      fullName: "Full name",
      phoneNumber: null,
      addedOn: "2025-01-14",
      isOnline: true,
    },
    {
      id: "3",
      email: "johnsmith@gmail.com",
      fullName: "John Smith",
      phoneNumber: "+1234567890",
      addedOn: "2025-01-13",
      isOnline: true,
    },
    {
      id: "4",
      email: "sarah.jones@example.com",
      fullName: "Sarah Jones",
      phoneNumber: null,
      addedOn: "2025-01-12",
      isOnline: true,
    },
    {
      id: "5",
      email: "mike.wilson@test.com",
      fullName: "Mike Wilson",
      phoneNumber: "+9876543210",
      addedOn: "2025-01-11",
      isOnline: true,
    },
  ];

  // Use mock data for now - replace with transactions data when API structure is confirmed
  const displayData = mockUsers;

  return (
    <div className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Added On
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              displayData.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-900">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{user.fullName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {user.phoneNumber || "No Phone Number"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {formatDate(user.addedOn)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}