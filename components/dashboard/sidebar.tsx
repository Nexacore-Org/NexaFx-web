"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, LogOut, Home, ArrowUpDown, Mail, CircleUserRound, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: ArrowUpDown, label: "Convert", href: "/convert" },
    { icon: Mail, label: "Transactions", href: "/transactions" },
    { icon: CircleUserRound, label: "Settings", href: "/settings" },
];

interface SidebarProps {
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    onMobileClose?: () => void;
}

export function Sidebar({ isCollapsed, onToggleCollapse, onMobileClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className={cn(
            "flex h-full flex-col transition-all duration-300",
            isCollapsed ? "w-20" : "w-64"
        )}>
            <div className="logo p-4">
                <div className={cn(
                    "flex items-center justify-between gap-2 rounded-full px-4 py-2 bg-white dark:bg-muted/20 border border-border transition-all",
                    isCollapsed ? "px-2 justify-center" : "px-4"
                )}>
                    {!isCollapsed && (
                        <img
                            src="/icons/logo.svg"
                            alt="Logo"
                            className="h-8"
                        />
                    )}

                    {onToggleCollapse && (
                        <button
                            onClick={onToggleCollapse}
                            className="hover:bg-muted rounded-full p-1 transition-colors"
                        >
                            {!isCollapsed ? (
                                <ChevronLeft className="size-5 text-black dark:text-white" />
                            ) : (
                                <ChevronRight className="size-5 text-black dark:text-white" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 space-y-2.5 px-4 py-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onMobileClose}
                        className={cn(
                            "flex items-center gap-3 rounded-full py-3 text-sm font-medium transition-all",
                            isCollapsed ? "justify-center px-0" : "px-4",
                            pathname === item.href
                                ? "bg-primary text-black"
                                : "bg-white dark:bg-muted/10 text-black dark:text-white hover:bg-sidebar-accent"
                        )}
                        title={isCollapsed ? item.label : ""}
                    >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                ))}
            </div>

            <div className="p-4 border-t border-border">
                <button
                    className={cn(
                        "flex w-full items-center gap-3 rounded-xl py-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all",
                        isCollapsed ? "justify-center px-0" : "px-4"
                    )}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
}

