"use client";

import { useState, useEffect } from "react";
import { sendWeeklyStatement } from "@/lib/api/users";
import { Loader2, Send } from "lucide-react";

export function NotificationPreferences() {
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSendStatement = async () => {
    if (cooldown > 0 || sending) return;
    try {
      setSending(true);
      await sendWeeklyStatement();
      setSuccess(true);
      setCooldown(86400);
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  };

  const formatCooldown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="rounded-2xl border border-border bg-card">
      <h3 className="text-muted-foreground font-semibold text-base mx-5 pt-6 pb-4 border-b border-border">
        Weekly Statement
      </h3>
      <div className="p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-foreground font-medium">
              Send me a statement now
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Receive a summary of your weekly transactions via email. You can
              request this once every 24 hours.
            </p>
          </div>
          <button
            onClick={handleSendStatement}
            disabled={cooldown > 0 || sending}
            className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-black rounded-lg text-sm font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : success ? (
              "Statement sent!"
            ) : cooldown > 0 ? (
              `Available in ${formatCooldown(cooldown)}`
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Statement
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
