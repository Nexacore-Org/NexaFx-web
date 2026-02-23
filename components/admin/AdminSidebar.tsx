"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ArrowUpDown,
    Bell,
    Users,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

const adminMenuItems = [
    { icon: LayoutDashboard, label: "Analytics", href: "/admin/analytics" },
    { icon: ArrowUpDown, label: "Transaction", href: "/admin/transactions" },
    {
        icon: Bell,
        label: "Push Notification",
        href: "/admin/push-notifications",
    },
    { icon: Users, label: "User list", href: "/admin/users" },
];

export function AdminSidebar({ isOpen, onClose }: Props) {
    const pathname = usePathname();

    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <div
                className={cn(
                    "fixed lg:relative top-0 left-0 h-full flex flex-col bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out",
                    isCollapsed ? "w-20" : "w-64",

                    isOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0",
                )}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        {!isCollapsed && (
                            <Image
                                src="/icons/logo.svg"
                                alt="NexaFX"
                                width={100}
                                height={32}
                                priority
                            />
                        )}
                        <button
                            onClick={onClose}
                            className=" p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors lg:hidden"
                        >
                            <X />
                        </button>
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors lg:block"
                        >
                            {isCollapsed ? (
                                <ChevronRight size={20} />
                            ) : (
                                <ChevronLeft size={20} />
                            )}
                        </button>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 ">
                    {adminMenuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 py-3 rounded-xl transition-all",
                                    isCollapsed
                                        ? "justify-center px-0"
                                        : "px-4",
                                    isActive
                                        ? "bg-[#F39A00] text-black font-semibold shadow-sm"
                                        : "text-gray-600 hover:bg-gray-50",
                                )}
                                title={isCollapsed ? item.label : ""}
                            >
                                <item.icon
                                    className={cn(
                                        "h-5 w-5 shrink-0",
                                        isActive
                                            ? "text-black"
                                            : "text-gray-400",
                                    )}
                                />
                                {!isCollapsed && (
                                    <span className="text-sm">
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}
