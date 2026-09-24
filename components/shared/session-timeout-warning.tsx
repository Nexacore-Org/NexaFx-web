"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AlertTriangle, LogOut } from "lucide-react";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useRouter } from "next/navigation";

// 15 minutes total timeout
const TIMEOUT_MS = 15 * 60 * 1000;
// Show warning 2 minutes before timeout
const WARNING_MS = 13 * 60 * 1000;

export function SessionTimeoutWarning() {
  const { isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  
  const lastActivityRef = useRef<number>(Date.now());
  const warningIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleActivity = useCallback(() => {
    if (showWarning) return; // Don't reset if warning is already showing
    lastActivityRef.current = Date.now();
  }, [showWarning]);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      return;
    }

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, handleActivity));

    const checkInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      if (timeSinceLastActivity >= TIMEOUT_MS) {
        // Logout
        logout();
        router.push("/sign-in?reason=timeout");
        setShowWarning(false);
      } else if (timeSinceLastActivity >= WARNING_MS) {
        // Show warning
        if (!showWarning) {
          setShowWarning(true);
          setTimeLeft(Math.ceil((TIMEOUT_MS - timeSinceLastActivity) / 1000));
        }
      }
    }, 1000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      clearInterval(checkInterval);
    };
  }, [isAuthenticated, handleActivity, logout, router, showWarning]);

  useEffect(() => {
    if (showWarning) {
      warningIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
    }

    return () => {
      if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
    };
  }, [showWarning]);

  const handleContinue = () => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border shadow-lg rounded-xl p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Session Expiring Soon
            </h2>
            <p className="text-sm text-muted-foreground">
              Your session will expire in{" "}
              <span className="font-semibold text-foreground">
                {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, "0")}
              </span>{" "}
              due to inactivity.
            </p>
          </div>
          <div className="flex flex-col w-full gap-2 pt-4">
            <button
              onClick={handleContinue}
              className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Continue Session
            </button>
            <button
              onClick={() => {
                logout();
                router.push("/sign-in");
                setShowWarning(false);
              }}
              className="w-full py-2.5 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Log Out Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
