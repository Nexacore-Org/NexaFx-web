const RECIPIENTS_KEY = "savedRecipients";

export interface SavedRecipient {
  id: string;
  label: string;
  walletAddress: string;
  currency: string;
  network?: string;
  createdAt: string;
}

export function getSavedRecipients(): SavedRecipient[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(RECIPIENTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addSavedRecipient(
  recipient: Omit<SavedRecipient, "id" | "createdAt">,
): SavedRecipient {
  const recipients = getSavedRecipients();

  const duplicateLabel = recipients.some(
    (r) => r.label.toLowerCase() === recipient.label.toLowerCase(),
  );
  if (duplicateLabel) {
    throw new Error("A recipient with this label already exists");
  }

  const duplicateAddress = recipients.some(
    (r) => r.walletAddress.toLowerCase() === recipient.walletAddress.toLowerCase(),
  );
  if (duplicateAddress) {
    throw new Error("A recipient with this wallet address already exists");
  }

  const newRecipient: SavedRecipient = {
    ...recipient,
    id: `recipient_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [...recipients, newRecipient];
  localStorage.setItem(RECIPIENTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));
  return newRecipient;
}

export function updateSavedRecipient(
  id: string,
  updates: Partial<Omit<SavedRecipient, "id" | "createdAt">>,
): void {
  const recipients = getSavedRecipients();
  const updated = recipients.map((r) =>
    r.id === id ? { ...r, ...updates } : r,
  );
  localStorage.setItem(RECIPIENTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));
}

export function removeSavedRecipient(id: string): void {
  const recipients = getSavedRecipients().filter((r) => r.id !== id);
  localStorage.setItem(RECIPIENTS_KEY, JSON.stringify(recipients));
  window.dispatchEvent(new Event("storage"));
}
