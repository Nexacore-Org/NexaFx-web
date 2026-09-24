"use client";

import { ReceiptText } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";

export function TransactionEmptyState() {
  const router = useRouter();

  return (
    <EmptyState
      icon={<ReceiptText className="h-16 w-16" />}
      title="No transactions yet"
      description="Your transaction history will appear here once you make a deposit or conversion."
      action={{ label: "Make your first deposit", onClick: () => router.push("/dashboard/deposit") }}
    />
  );
}
