"use client";

import { ArrowUpDown, FileText, MessageSquare, Flag } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Activity, BarChart3, Bell, Users } from "lucide-react";
import { getFlaggedTransactions } from "@/lib/api/admin";
import { SidebarShell, NavItem } from "@/components/shared/sidebar-shell";

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export function AdminSidebar({ isOpen, onClose }: Props) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [flaggedCount, setFlaggedCount] = useState<number | null>(null);

    const fetchFlaggedCount = useCallback(async () => {
        try {
            const items = await getFlaggedTransactions();
            setFlaggedCount(items.length);
        } catch {
            setFlaggedCount(null);
        }
    }, []);

    useEffect(() => {
        fetchFlaggedCount();
        const interval = setInterval(fetchFlaggedCount, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchFlaggedCount]);

    const adminMenuItems: NavItem[] = [
        { lucide: BarChart3, label: "Analytics", href: "/admin/analytics" },
        { lucide: ArrowUpDown, label: "Transaction", href: "/admin/transactions" },
        { lucide: Flag, label: "Flagged", href: "/admin/flagged", badge: true, badgeCount: flaggedCount },
        { lucide: Bell, label: "Push Notification", href: "/admin/push-notifications" },
        { lucide: Users, label: "User list", href: "/admin/users" },
        { lucide: FileText, label: "Reports", href: "/admin/reports" },
        { lucide: MessageSquare, label: "Disputes", href: "/admin/disputes" },
    ];

    return (
        <SidebarShell
            navItems={adminMenuItems}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            isOpen={isOpen}
            onClose={onClose}
            onNavClick={onClose}
            variant="admin"
        />
    );
}
