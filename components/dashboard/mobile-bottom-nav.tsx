"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Mail,
  ArrowUpDown,
  Plus,
  MoreGrid,
  LogOut,
  Settings,
  TrendingUp,
  RotateCcw,
  Lightbulb,
  Users,
  Clock,
  HelpCircle,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useNotificationsStore } from "@/hooks/use-notifications-store";
import { usePriceAlerts } from "@/hooks/use-price-alerts";
import { BottomSheet } from "@/components/ui/bottom-sheet";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  action?: () => void;
}

const mainNavItems: NavItem[] = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Mail, label: "Transactions", href: "/dashboard/transactions" },
  { icon: ArrowUpDown, label: "Convert", href: "/dashboard/convert" },
  { icon: Plus, label: "Deposit", href: "/dashboard/deposit" },
];

const moreNavItems: NavItem[] = [
  { icon: RotateCcw, label: "Withdraw", href: "/dashboard/withdraw" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  { icon: TrendingUp, label: "Insights", href: "/dashboard/insights" },
  { icon: Users, label: "Referrals", href: "/dashboard/referrals" },
  { icon: Clock, label: "Schedules", href: "/dashboard/schedules" },
  { icon: HelpCircle, label: "Support", href: "/dashboard/support" },
  { icon: Zap, label: "What's New", href: "/dashboard/whats-new" },
];

interface MobileBottomNavProps {
  // Component can be extended with optional props if needed
}

export function MobileBottomNav({}: MobileBottomNavProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const hasPriceAlert = usePriceAlerts();

  const handleMoreItemClick = (href?: string) => {
    if (href) {
      router.push(href);
      setIsMoreSheetOpen(false);
    }
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    // Normalize pathname for comparison
    const normalizedPathname = pathname.split("?")[0];
    return (
      normalizedPathname === href || normalizedPathname.startsWith(href + "/")
    );
  };

  const NavButton = ({
    item,
    showBadge = false,
  }: {
    item: NavItem;
    showBadge?: boolean;
  }) => (
    <div className="flex flex-col items-center gap-1 flex-1 relative">
      <button
        className={cn(
          "relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400",
          isActive(item.href)
            ? "bg-primary/20 text-primary"
            : "text-muted-foreground hover:bg-muted",
        )}
        aria-label={item.label}
        aria-current={isActive(item.href) ? "page" : undefined}
      >
        <item.icon className="h-6 w-6" />
        {showBadge && (
          <span
            className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-full border border-background"
            aria-label="Price alert active"
          />
        )}
      </button>
      <span
        className={cn(
          "text-xs font-medium transition-colors",
          isActive(item.href) ? "text-primary" : "text-muted-foreground",
        )}
      >
        {item.label}
      </span>
    </div>
  );

  return (
    <>
      {/* Bottom Navigation Bar - Mobile Only */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 md:hidden",
          "bg-background border-t border-border",
          "flex items-center gap-0.5 px-2 py-2",
          "safe-area-inset-bottom",
        )}
        style={{
          paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
        }}
        aria-label="Mobile navigation"
      >
        {/* Main Navigation Items */}
        {mainNavItems.map((item) => (
          <Link key={item.href} href={item.href || "#"} className="flex-1">
            <NavButton
              item={item}
              showBadge={item.label === "Convert" && hasPriceAlert}
            />
          </Link>
        ))}

        {/* More Menu Button */}
        <button
          onClick={() => setIsMoreSheetOpen(true)}
          className={cn(
            "flex flex-col items-center gap-1 flex-1 relative",
            "focus:outline-none focus:ring-2 focus:ring-yellow-400",
          )}
          aria-label="More options"
        >
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
              "text-muted-foreground hover:bg-muted",
            )}
          >
            <MoreGrid className="h-6 w-6" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            More
          </span>
        </button>
      </nav>

      {/* More Items Bottom Sheet */}
      <BottomSheet
        isOpen={isMoreSheetOpen}
        onClose={() => setIsMoreSheetOpen(false)}
        title="More Options"
      >
        <div className="grid grid-cols-4 gap-4 mt-6">
          {moreNavItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleMoreItemClick(item.href)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400",
                isActive(item.href)
                  ? "bg-primary/20 text-primary"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground",
              )}
              aria-label={item.label}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium text-center">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            // TODO: Implement logout logic
            console.log("Logout clicked");
            setIsMoreSheetOpen(false);
          }}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg mt-6",
            "bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors",
            "font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400",
          )}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </BottomSheet>
    </>
  );
}
