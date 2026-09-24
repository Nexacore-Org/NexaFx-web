"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addInvoice } from "@/lib/utils/invoices";
import { validateStellarAddress } from "@/lib/utils/stellar-validation";
import { useUser } from "@/hooks/use-user"; // Assuming a hook to get user info

export default function CreateInvoicePage() {
  const router = useRouter();
  const { user } = useUser(); // Assuming you have a way to get the current user
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!amount || !user) return;

    const addressValidation = validateStellarAddress(user.walletAddress ?? "");
    if (!addressValidation.valid) {
      setError(addressValidation.error ?? "Your wallet address is not valid.");
      return;
    }

    const newInvoice = {
      id: uuidv4(),
      amount: parseFloat(amount),
      currency,
      description,
      senderName: user.name, // Assuming user object has a name property
      walletAddress: user.walletAddress,
      createdAt: new Date().toISOString(),
      status: "Pending" as const,
    };

    addInvoice(newInvoice);
    router.push("/dashboard/invoices"); // Redirect to the invoice list
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">Create Invoice</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100.00"
              required
            />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="NGN">NGN</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Payment for services rendered"
            maxLength={200}
          />
        </div>

        <div>
          <Label>Your Name</Label>
          <p className="text-muted-foreground">{user?.name ?? "Loading..."}</p>
        </div>

        <Button type="submit" className="w-full sm:w-auto">
          Generate Invoice
        </Button>
      </form>
    </div>
  );
}
