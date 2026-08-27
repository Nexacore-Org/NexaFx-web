"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "icon" | "full";
  className?: string;
}

export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("h-9 w-9 rounded-md bg-muted animate-pulse", className)} />
    );
  }

  if (variant === "full") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <button
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            theme === "light"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          <Sun className="h-4 w-4" />
          Light
        </button>
        <button
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            theme === "dark"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          <Moon className="h-4 w-4" />
          Dark
        </button>
        <button
          onClick={() => setTheme("system")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            theme === "system"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          <Monitor className="h-4 w-4" />
          System
        </button>
      </div>
    );
  }

  // icon variant: cycles through light → dark → system
  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const Icon = theme === "dark" ? Moon : theme === "system" ? Monitor : Sun;

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        "h-9 w-9 rounded-md flex items-center justify-center transition-colors hover:bg-muted",
        className,
      )}
      aria-label="Toggle theme"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
