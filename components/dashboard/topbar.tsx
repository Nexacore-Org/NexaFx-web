"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div className="text-sm text-muted-foreground">
        {user ? `Signed in as ${user.email}` : "Not signed in"}
      </div>
      {user ? (
        <Button variant="ghost" size="sm" onClick={() => void logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      ) : null}
    </header>
  );
}
