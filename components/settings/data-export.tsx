"use client";

import { useState } from "react";
import { Download, Loader2, CheckCircle2 } from "lucide-react";
import { getProfile } from "@/lib/api/users";
import { getTransactions } from "@/lib/api/transactions";
import { exportTransactionsToCSV } from "@/app/lib/utils/csv-export";

type ExportStatus = "idle" | "exporting" | "done" | "error";

export function DataExport() {
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setStatus("exporting");
      setErrorMsg(null);

      const [profile, txResult] = await Promise.all([
        getProfile(),
        getTransactions({ page: 1, limit: 1000 }),
      ]);

      const profileData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone ?? "",
        walletAddress: profile.walletAddress ?? "",
      };

      const profileCsv = [
        ["Field", "Value"],
        ["First Name", profileData.firstName],
        ["Last Name", profileData.lastName],
        ["Email", profileData.email],
        ["Phone", profileData.phone],
        ["Wallet Address", profileData.walletAddress],
      ]
        .map((row) => row.map((f) => `"${f.replace(/"/g, '""')}"`).join(","))
        .join("\n");

      const profileBlob = new Blob([profileCsv], {
        type: "text/csv;charset=utf-8;",
      });
      const profileUrl = URL.createObjectURL(profileBlob);
      const profileLink = document.createElement("a");
      profileLink.href = profileUrl;
      profileLink.download = `nexafx-profile-${new Date().toISOString().split("T")[0]}.csv`;
      profileLink.style.visibility = "hidden";
      document.body.appendChild(profileLink);
      profileLink.click();
      document.body.removeChild(profileLink);
      URL.revokeObjectURL(profileUrl);

      if (txResult.data.length > 0) {
        exportTransactionsToCSV(
          txResult.data,
          `nexafx-transactions-${new Date().toISOString().split("T")[0]}.csv`,
        );
      }

      setStatus("done");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to export data",
      );
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="px-5 pt-6 pb-4 border-b border-border">
        <h2 className="text-base font-semibold text-foreground">
          Download My Data
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Export your profile information and transaction history as CSV files.
        </p>
      </div>

      <div className="px-5 py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="max-w-lg">
            <p className="text-sm text-foreground">
              This will download two CSV files: your profile data and your full
              transaction history.
            </p>
            {status === "done" && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="size-4" />
                Export complete. Check your downloads.
              </p>
            )}
            {status === "error" && errorMsg && (
              <p className="text-sm text-red-600 mt-2">{errorMsg}</p>
            )}
          </div>

          <button
            onClick={handleExport}
            disabled={status === "exporting"}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "exporting" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {status === "exporting" ? "Exporting..." : "Download Data"}
          </button>
        </div>
      </div>
    </div>
  );
}
