"use client";

import { useEffect, useState } from "react";
import { Bell, Menu, User, Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/hooks/use-sidebar-store";

export function Topbar() {
    const pathname = usePathname();
    const open = useSidebarStore((state) => state.open);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check initial theme
        const isDark = document.documentElement.classList.contains("dark");
        setIsDarkMode(isDark);
    }, []);

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    // Format title from pathname: /dashboard -> Dashboard
    const title = pathname.split("/").filter(Boolean).pop() || "Dashboard";
    const capitalisedTitle = title.charAt(0).toUpperCase() + title.slice(1);

    return (
        <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button
                    onClick={open}
                    className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">{capitalisedTitle}</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 hover:bg-muted rounded-full transition-colors text-foreground"
                    title="Toggle Theme"
                >
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>

                <button className="relative p-2 hover:bg-muted rounded-full transition-colors text-foreground">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-background" />
                </button>

                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                    <User className="h-6 w-6 text-muted-foreground" />
                </div>
            </div>
        </header>
    );
}
