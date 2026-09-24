"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InvoiceList } from "@/components/dashboard/invoice/invoice-list";
import { Plus } from "lucide-react";

export default function InvoicesPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link href="/invoice">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </Link>
      </div>
      <InvoiceList />
    </div>
  );
}
