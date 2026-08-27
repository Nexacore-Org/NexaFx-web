"use client";

import { useState, useEffect } from "react";
import {
  getInvoices,
  updateInvoiceStatus,
  deleteInvoice,
} from "@/lib/utils/invoices";
import { Invoice } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, CheckCircle, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const handleStorageChange = () => {
      setInvoices(getInvoices());
    };

    setInvoices(getInvoices());
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/pay/${id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied to clipboard",
      description: "Invoice link copied successfully.",
    });
  };

  const handleMarkAsPaid = (id: string) => {
    updateInvoiceStatus(id, "Paid");
  };

  const handleDelete = (id: string) => {
    deleteInvoice(id);
  };

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">No Invoices Yet</h3>
        <p className="text-muted-foreground mt-2">
          Create your first invoice to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="bg-card border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div className="flex-grow">
            <div className="flex items-center gap-4 mb-2">
              <p className="font-semibold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: invoice.currency,
                }).format(invoice.amount)}
              </p>
              <Badge
                className={
                  invoice.status === "Paid"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }
              >
                {invoice.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {invoice.description || "No description"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Created: {new Date(invoice.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare(invoice.id)}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {invoice.status === "Pending" && (
                  <DropdownMenuItem
                    onClick={() => handleMarkAsPaid(invoice.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => handleDelete(invoice.id)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}
