"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, LogOut, Home, ArrowUpDown, Mail, CircleUserRound, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: ArrowUpDown, label: "Convert", href: "/convert" },
    { icon: Mail, label: "Transactions", href: "/transactions" },
    { icon: CircleUserRound, label: "Settings", href: "/settings" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col md:flex">
            <div className="logo p-4">
                <div className="w-full flex items-center justify-between gap-2 rounded-full px-4 py-2 bg-white">
                    <img
                        src="/icons/logo.svg"
                        alt="Logo"
                    />

                    <button className="">
                        <ChevronLeft className="size-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 space-y-2.5 px-4 py-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-colors",
                            pathname === item.href
                                ? "bg-primary text-black"
                                : "bg-white text-black hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </Link>
                ))}
            </div>

            <div className="p-4 border-t">
                <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
            </div>
        </div>
    );
}
