"use client";

import { Eye } from "lucide-react";

export function PersonalInfo() {
  const user = {
    firstLast: "First name , Last name",
    email: "cerseiloaded@hotmail.com",
    phone: "+65 9012474475",
  };

  return (
    <div className="bg-white dark:bg-card border border-border/50 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-base font-semibold text-foreground">
          Personal Info
        </h3>
        <Eye className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-1 border-b border-border/10 last:border-0">
          <span className="text-sm text-muted-foreground w-1/3">Name</span>
          <span className="text-sm font-medium text-foreground text-right">
            {user.firstLast}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-1 border-b border-border/10 last:border-0">
          <span className="text-sm text-muted-foreground w-1/3">
            Email address
          </span>
          <span className="text-sm font-medium text-foreground text-right">
            {user.email}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-1 border-b border-border/10 last:border-0">
          <span className="text-sm text-muted-foreground w-1/3">
            Phone Number
          </span>
          <span className="text-sm font-medium text-foreground text-right">
            {user.phone}
          </span>
        </div>
      </div>
    </div>
  );
}
