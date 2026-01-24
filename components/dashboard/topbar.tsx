"use client";

import { Bell, Menu, User } from "lucide-react";
import { usePathname } from "next/navigation";

interface TopbarProps {
    onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
    const pathname = usePathname();

    // Format title from pathname: /dashboard -> Dashboard
    const title = pathname.split("/").filter(Boolean).pop() || "Dashboard";
    const capitalisedTitle = title.charAt(0).toUpperCase() + title.slice(1);

    return (
        <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-semibold tracking-tight">{capitalisedTitle}</h1>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 hover:bg-muted rounded-full transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-card" />
                </button>
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                    <User className="h-6 w-6 text-muted-foreground" />
                </div>
            </div>
        </header>
    );
}
