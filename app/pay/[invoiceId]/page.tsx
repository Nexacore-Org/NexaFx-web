"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import QRCode from "react-qr-code";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInvoice } from "@/lib/utils/invoices";
import { validateStellarAddress } from "@/lib/utils/stellar-validation";
import { Invoice } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export default function PayInvoicePage() {
  const params = useParams();
  const { invoiceId } = params;
  const [copied, setCopied] = useState(false);
  const invoice = useMemo<Invoice | null>(() => {
    return typeof invoiceId === "string" ? getInvoice(invoiceId) ?? null : null;
  }, [invoiceId]);

  const handleCopy = () => {
    if (invoice?.walletAddress) {
      navigator.clipboard.writeText(invoice.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
        <h1 className="text-2xl font-bold mb-4">Invoice Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The invoice you are looking for does not exist or has been deleted.
        </p>
        <Link href="/signup">
          <Button>Get Started with NexaFx</Button>
        </Link>
      </div>
    );
  }

  const addressValidation = validateStellarAddress(invoice.walletAddress);
  const canDisplayWallet = addressValidation.valid;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-lg border">
        <div className="text-center mb-6">
          <h1 className="text-lg text-muted-foreground">
            Payment Request from{" "}
            <span className="font-semibold text-foreground">
              {invoice.senderName}
            </span>
          </h1>
        </div>

        <div className="text-center mb-8">
          <p className="text-4xl font-bold">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: invoice.currency,
            }).format(invoice.amount)}
          </p>
          <Badge
            className={`mt-2 ${
              invoice.status === "Paid" ? "bg-green-500" : "bg-yellow-500"
            }`}
          >
            {invoice.status}
          </Badge>
        </div>

        {invoice.description && (
          <p className="text-center text-muted-foreground mb-8">
            {invoice.description}
          </p>
        )}

        <div className="bg-muted p-4 rounded-lg mb-8">
          <p className="text-sm text-center text-muted-foreground mb-4">
            To pay, send the exact amount to the wallet address below.
          </p>
          {canDisplayWallet ? (
            <>
              <div className="flex items-center justify-center mb-4">
                <QRCode
                  value={invoice.walletAddress}
                  size={128}
                  bgColor="var(--muted)"
                  fgColor="var(--foreground)"
                />
              </div>
              <div className="relative bg-background rounded-md p-2 flex items-center">
                <p className="text-sm font-mono break-all flex-grow">
                  {invoice.walletAddress}
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCopy}
                  className="h-8 w-8 flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {copied && (
                  <span className="absolute -top-8 right-0 bg-foreground text-background text-xs px-2 py-1 rounded">
                    Copied!
                  </span>
                )}
              </div>
            </>
          ) : (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {addressValidation.error ?? "This invoice has an invalid Stellar wallet address."}
            </p>
          )}
        </div>

        <Link href="/signup" className="w-full">
          <Button className="w-full">Pay with NexaFx</Button>
        </Link>
      </div>
      <p className="text-xs text-muted-foreground mt-4">Powered by NexaFx</p>
    </div>
  );
}
