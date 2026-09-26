"use client";

import {
  Home,
  Mail,
  CircleUserRound,
  ArrowUpDown,
  TrendingUp,
  FileText,
  Code2,
} from "lucide-react";
import { useSidebarStore } from "@/hooks/use-sidebar-store";
import { SidebarShell, NavItem } from "@/components/shared/sidebar-shell";

const menuItems: NavItem[] = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Mail, label: "Transactions", href: "/transactions" },
  { icon: FileText, label: "Invoices", href: "/invoices" },
  { icon: TrendingUp, label: "Insights", href: "/insights" },
  { icon: Code2, label: "Developer API", href: "/developer" },
  { icon: CircleUserRound, label: "Settings", href: "/settings" },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const close = useSidebarStore((state) => state.close);

  return (
    <SidebarShell
      navItems={menuItems}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse ?? (() => {})}
      onNavClick={close}
      variant="dashboard"
    />
  );
}
