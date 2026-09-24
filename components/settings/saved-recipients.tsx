"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, X, Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getSavedRecipients,
  addSavedRecipient,
  updateSavedRecipient,
  removeSavedRecipient,
  type SavedRecipient,
} from "@/lib/utils/saved-recipients";

export function SavedRecipients() {
  const [recipients, setRecipients] = useState<SavedRecipient[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [currency, setCurrency] = useState("BTC");
  const [network, setNetwork] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRecipients(getSavedRecipients());
    const handler = () => setRecipients(getSavedRecipients());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const resetForm = () => {
    setLabel("");
    setWalletAddress("");
    setCurrency("BTC");
    setNetwork("");
    setError(null);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!label.trim()) {
      setError("Label is required");
      return;
    }
    if (!walletAddress.trim()) {
      setError("Wallet address is required");
      return;
    }
    try {
      addSavedRecipient({
        label: label.trim(),
        walletAddress: walletAddress.trim(),
        currency,
        network: network.trim() || undefined,
      });
      setRecipients(getSavedRecipients());
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add recipient");
    }
  };

  const handleUpdate = (id: string) => {
    if (!label.trim()) {
      setError("Label is required");
      return;
    }
    if (!walletAddress.trim()) {
      setError("Wallet address is required");
      return;
    }
    updateSavedRecipient(id, {
      label: label.trim(),
      walletAddress: walletAddress.trim(),
      currency,
      network: network.trim() || undefined,
    });
    setRecipients(getSavedRecipients());
    resetForm();
  };

  const handleDelete = (id: string) => {
    removeSavedRecipient(id);
    setRecipients(getSavedRecipients());
  };

  const startEdit = (recipient: SavedRecipient) => {
    setEditingId(recipient.id);
    setLabel(recipient.label);
    setWalletAddress(recipient.walletAddress);
    setCurrency(recipient.currency);
    setNetwork(recipient.network ?? "");
    setIsAdding(true);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Saved Recipients</h3>
            <p className="text-sm text-muted-foreground">
              Manage your saved wallet addresses
            </p>
          </div>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Recipient
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">
              {editingId ? "Edit Recipient" : "New Recipient"}
            </h4>
            <button
              onClick={resetForm}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Label (e.g. My Savings)"
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              if (error) setError(null);
            }}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            placeholder="Wallet Address"
            value={walletAddress}
            onChange={(e) => {
              setWalletAddress(e.target.value);
              if (error) setError(null);
            }}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex gap-3">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
            </select>
            <input
              type="text"
              placeholder="Network (optional)"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          <button
            onClick={() => (editingId ? handleUpdate(editingId) : handleAdd())}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Check className="h-4 w-4" />
            {editingId ? "Save Changes" : "Add Recipient"}
          </button>
        </div>
      )}

      {recipients.length === 0 && !isAdding && (
        <div className="text-center py-8">
          <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No saved recipients yet. Add one to quickly send money later.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {recipients.map((recipient) => (
          <div
            key={recipient.id}
            className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {recipient.label}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {recipient.walletAddress}
              </p>
              <div className="flex gap-2 mt-1">
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {recipient.currency}
                </span>
                {recipient.network && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {recipient.network}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 ml-3">
              <button
                onClick={() => startEdit(recipient)}
                className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                aria-label="Edit recipient"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(recipient.id)}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted rounded-lg transition-colors"
                aria-label="Delete recipient"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
