"use client";

import { useState } from "react";
import { Bell, User, Menu } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { usePathname } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const title = pathname.split("/").filter(Boolean).pop() || "Admin";
    const capitalisedTitle =
        title.charAt(0).toUpperCase() + title.slice(1).replace(/-/g, " ");

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <AdminGuard>
            <div className="flex h-screen bg-gray-50 overflow-hidden">
                {/* Sidebar */}
                <AdminSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Topbar */}
                    <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                            >
                                <Menu size={22} />
                            </button>
                            <h1 className="text-md font-semibold text-gray-900 md:text-lg">
                                {capitalisedTitle}
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                            </button>

                            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-gray-900">
                                        Admin User
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Super Admin
                                    </p>
                                </div>
                                <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden border border-gray-200">
                                    <User size={20} />
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </AdminGuard>
    );
}
