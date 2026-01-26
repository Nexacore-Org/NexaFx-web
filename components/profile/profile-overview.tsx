"use client";

import { Copy } from "lucide-react";

export function ProfileOverview() {
  const user = {
    username: "cerseiload",
    userId: "0xAbc...123",
    avatarUrl: null,
  };

  return (
    <div className="bg-white dark:bg-card rounded-xl p-8 border border-border/50 shadow-sm flex flex-col items-center text-center space-y-4 h-full min-h-[300px] justify-center">
      <div className="relative">
        <div className="h-24 w-24 rounded-2xl bg-[#5E5699] flex items-center justify-center overflow-hidden shadow-lg">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=cerseiload"
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground">{user.username}</h2>
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm cursor-pointer hover:text-foreground transition-colors group">
          <span>{user.userId}</span>
          <Copy className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
        </div>
      </div>

      <div className="pt-2">
        <span className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/30 px-6 py-1.5 text-sm font-medium text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
          Unverified
        </span>
      </div>
    </div>
  );
}
