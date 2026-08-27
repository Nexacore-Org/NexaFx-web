"use client";

import { useState, useEffect } from "react";
import {
  getSessions,
  terminateSession,
  terminateAllOtherSessions,
  UserSession,
} from "@/lib/api/users";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

export function ActiveSessions() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await getSessions();
      setSessions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleTerminate = async (id: string) => {
    try {
      await terminateSession(id);
      await fetchSessions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to terminate session",
      );
    }
  };

  const handleTerminateAll = async () => {
    if (window.confirm("Are you sure you want to log out all other devices?")) {
      try {
        await terminateAllOtherSessions();
        await fetchSessions();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to terminate all other sessions",
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[100px]">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base text-foreground">
            Active Sessions
          </h3>
          <p className="text-xs text-muted-foreground">
            Manage your active sessions across all devices.
          </p>
        </div>
        <Button onClick={handleTerminateAll} size="sm" variant="destructive">
          Log out all other devices
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between rounded-xl border border-border/50 p-3"
          >
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {session.deviceInfo}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session.ipAddress}{" "}
                  {session.location && `· ${session.location}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last active{" "}
                  {new Date(session.lastActiveAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {session.isCurrent ? (
              <span className="text-xs font-medium text-primary">
                Current session
              </span>
            ) : (
              <button
                onClick={() => handleTerminate(session.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                aria-label="Terminate session"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
