"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:block">
                <Sidebar />
            </aside>

            {/* Sidebar - Mobile Drawer Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Mobile Drawer */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <Sidebar />
            </aside>

            <div className="flex flex-1 flex-col overflow-hidden ml-0 md:ml-2">
                <main className="flex-1 overflow-y-auto md:py-4">
                    {children}
                </main>
            </div>
        </div>
    );
}
