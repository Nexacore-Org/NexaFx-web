"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface NavItem {
  icon?: React.ComponentType<{ className?: string }>;
  lucide?: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: boolean;
  badgeCount?: number | null;
}

interface SidebarShellProps {
  navItems: NavItem[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onNavClick?: () => void;
  variant?: "dashboard" | "admin";
  children?: React.ReactNode;
}

const variantStyles = {
  dashboard: {
    outer: "flex h-full flex-col transition-all duration-300",
    logoContainer: (collapsed: boolean) =>
      cn(
        "flex items-center justify-between gap-2 rounded-full px-4 py-2 bg-white dark:bg-muted/20 border border-border transition-all",
        collapsed ? "px-2 justify-center" : "px-4",
      ),
    toggleButton:
      "hover:bg-muted rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2",
    toggleIcon: "size-5 text-black dark:text-white",
    navArea: "flex-1 space-y-2.5 px-4 py-4",
    navLink: (collapsed: boolean, isActive: boolean) =>
      cn(
        "flex items-center gap-3 rounded-full py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 rounded-lg",
        collapsed ? "justify-center px-0" : "px-4",
        isActive
          ? "bg-primary text-black"
          : "bg-white dark:bg-muted/10 text-black dark:text-white hover:bg-sidebar-accent",
      ),
    iconClass: "h-5 w-5 shrink-0",
  },
  admin: {
    outer: "fixed lg:relative top-0 left-0 h-full flex flex-col bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out",
    logoContainer: (collapsed: boolean) =>
      cn("flex items-center justify-between", collapsed && "justify-center"),
    toggleButton:
      "hidden lg:block p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors",
    toggleIcon: "",
    navArea: "flex-1 px-4 space-y-2",
    navLink: (collapsed: boolean, isActive: boolean) =>
      cn(
        "flex items-center gap-3 py-3 rounded-xl transition-all",
        collapsed ? "justify-center px-0" : "px-4",
        isActive
          ? "bg-[#FFD552] text-black font-semibold shadow-sm"
          : "text-gray-600 hover:bg-gray-50",
      ),
    iconClass: "h-5 w-5 shrink-0",
  },
} as const;

export function SidebarShell({
  navItems,
  isCollapsed,
  onToggleCollapse,
  isOpen = false,
  onClose,
  onNavClick,
  variant = "dashboard",
  children,
}: SidebarShellProps) {
  const pathname = usePathname();
  const styles = variantStyles[variant];

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href;
    const Icon = item.lucide ?? item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavClick}
        className={styles.navLink(isCollapsed, isActive)}
        title={isCollapsed ? item.label : ""}
        aria-label={item.label}
        aria-current={isActive ? "page" : undefined}
      >
        {Icon && (
          <Icon
            className={cn(
              styles.iconClass,
              variant === "admin" && isActive ? "text-black" : "",
              variant === "admin" && !isActive ? "text-gray-400" : "",
            )}
          />
        )}
        {!isCollapsed && <span className="text-sm">{item.label}</span>}
        {item.badge && !isCollapsed && item.badgeCount !== null && item.badgeCount !== undefined && item.badgeCount > 0 && (
          <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-white bg-red-500 rounded-full">
            {item.badgeCount > 99 ? "99+" : item.badgeCount}
          </span>
        )}
        {item.badge && isCollapsed && item.badgeCount !== null && item.badgeCount !== undefined && item.badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-500 rounded-full pointer-events-none">
            {item.badgeCount > 9 ? "!" : item.badgeCount}
          </span>
        )}
      </Link>
    );
  };

  const logoContent = (
    <div className={styles.logoContainer(isCollapsed)}>
      {!isCollapsed && (
        <Image
          src="/icons/logo.svg"
          alt="NexaFX logo"
          className={cn(variant === "dashboard" && "h-8")}
          width={100}
          height={variant === "dashboard" ? 100 : 32}
          priority
        />
      )}
      {variant === "admin" && onClose && (
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors lg:hidden"
        >
          <X size={20} />
        </button>
      )}
      <button
        onClick={onToggleCollapse}
        className={cn(
          styles.toggleButton,
          variant === "dashboard" && "lg:hidden",
        )}
        aria-label={isCollapsed ? "Expand navigation menu" : "Collapse navigation menu"}
      >
        {variant === "dashboard" ? (
          isCollapsed ? (
            <ChevronRight className={styles.toggleIcon} />
          ) : (
            <ChevronLeft className={styles.toggleIcon} />
          )
        ) : (
          isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />
        )}
      </button>
    </div>
  );

  return (
    <>
      {variant === "admin" && isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={cn(
          styles.outer,
          variant === "admin" && (isCollapsed ? "w-20" : "w-64"),
          variant === "admin" && (isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"),
        )}
      >
        <div className="p-4 lg:p-6">{logoContent}</div>
        <nav className={styles.navArea} role="navigation" aria-label="Main navigation">
          {children
            ? children
            : navItems.map(renderNavItem)}
        </nav>
      </div>
    </>
  );
}
