"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useRouter } from "next/navigation";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useRef } from "react";

interface SessionTimeoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStaySignedIn: () => void;
  remainingTimeMs: number;
}

export function SessionTimeoutModal({
  isOpen,
  onClose,
  onStaySignedIn,
  remainingTimeMs,
}: SessionTimeoutModalProps) {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(remainingTimeMs);
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(isOpen, onClose, modalRef);

  useEffect(() => {
    if (!isOpen) return;

    setTimeLeft(remainingTimeMs);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(interval);
          handleSignOut();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, remainingTimeMs]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleStaySignedIn = async () => {
    try {
      await onStaySignedIn();
      onClose();
    } catch (error) {
      console.error("Failed to stay signed in:", error);
      handleSignOut();
    }
  };

  const handleSignOut = () => {
    logout();
    router.push("/sign-in");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-300">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-timeout-title"
        className="bg-card text-card-foreground rounded-xl p-6 shadow-sm border border-border/50 relative max-w-md w-full mx-4"
      >
        <h2
          id="session-timeout-title"
          className="text-xl font-semibold mb-4 text-center"
        >
          Session Timeout Warning
        </h2>

        <p className="text-center mb-6 text-muted-foreground">
          Your session will expire in{" "}
          <span className="font-semibold text-foreground">
            {formatTime(timeLeft)}
          </span>
          . Do you want to stay signed in?
        </p>

        <div className="flex gap-3 flex-col sm:flex-row">
          <button
            onClick={handleStaySignedIn}
            className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
            aria-label="Stay signed in and extend session"
          >
            Stay Signed In
          </button>
          <button
            onClick={handleSignOut}
            className="flex-1 py-3 border-2 border-border hover:bg-muted text-foreground font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
            aria-label="Sign out now"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
