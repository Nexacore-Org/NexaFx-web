"use client";

import { useState } from "react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { addDisputeNote, resolveDispute, type Dispute } from "@/lib/api/admin-ops";

export default function DisputeTable({ initial }: { initial: Dispute[] }) {
  const [disputes, setDisputes] = useState(initial);
  const [resolving, setResolving] = useState<{ d: Dispute; resolution: "refund" | "reject" } | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const replace = (d: Dispute) => setDisputes((all) => all.map((x) => (x.id === d.id ? d : x)));
  const run = (fn: () => Promise<Dispute>) =>
    fn().then(replace).catch((e: Error) => setError(e.message || "Request failed"));

  if (!disputes.length) return <p className="py-8 text-center text-muted-foreground">No disputes.</p>;
  return (
    <div className="space-y-4">
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {disputes.map((d) => (
        <section key={d.id} className="space-y-2 rounded-lg border p-4 text-sm">
          <p className="font-medium">{d.transactionId} · {d.status}</p>
          <p>{d.reason}</p>
          <ul className="list-disc pl-5">{d.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (notes[d.id]?.trim()) void run(() => addDisputeNote(d.id, notes[d.id])).then(() => setNotes((n) => ({ ...n, [d.id]: "" }))); }}>
            <label className="sr-only" htmlFor={`note-${d.id}`}>Add note</label>
            <input id={`note-${d.id}`} value={notes[d.id] ?? ""} onChange={(e) => setNotes((n) => ({ ...n, [d.id]: e.target.value }))} className="flex-1 rounded-md border px-2 py-1" placeholder="Add a note" />
            <button type="submit" className="rounded-md border px-3 py-1">Add note</button>
          </form>
          {d.status === "open" && (
            <div className="flex gap-2">
              <button type="button" className="rounded-md border px-3 py-1" onClick={() => setResolving({ d, resolution: "refund" })}>Refund</button>
              <button type="button" className="rounded-md border px-3 py-1" onClick={() => setResolving({ d, resolution: "reject" })}>Reject</button>
            </div>
          )}
        </section>
      ))}
      <ConfirmDialog
        open={!!resolving}
        title={resolving?.resolution === "refund" ? "Refund this dispute?" : "Reject this dispute?"}
        confirmLabel="Resolve"
        onCancel={() => setResolving(null)}
        onConfirm={() => { if (resolving) void run(() => resolveDispute(resolving.d.id, resolving.resolution)); setResolving(null); }}
      />
    </div>
  );
}
