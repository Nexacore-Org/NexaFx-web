"use client";

import { useState } from "react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { createAnnouncement, deleteAnnouncement, toggleAnnouncement, type Announcement } from "@/lib/api/admin-ops";

export default function AnnouncementManager({ initial }: { initial: Announcement[] }) {
  const [items, setItems] = useState(initial);
  const [draft, setDraft] = useState({ title: "", body: "" });
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Announcement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fail = (e: Error) => setError(e.message || "Request failed");

  return (
    <div className="space-y-4 text-sm">
      {error && <p role="alert" className="text-red-600">{error}</p>}
      <button type="button" className="rounded-md border px-3 py-1.5" onClick={() => setCreating(true)}>New announcement</button>
      <ul className="space-y-2">
        {items.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <div><p className="font-medium">{a.title}</p><p className="text-muted-foreground">{a.body}</p></div>
            <div className="flex gap-2">
              <button type="button" role="switch" aria-checked={a.active} aria-label={`Active: ${a.title}`} className="rounded-md border px-3 py-1"
                onClick={() => toggleAnnouncement(a.id, !a.active).then((u) => setItems((all) => all.map((x) => (x.id === u.id ? u : x)))).catch(fail)}>
                {a.active ? "Active" : "Inactive"}
              </button>
              <button type="button" className="rounded-md border px-3 py-1 text-red-600" onClick={() => setDeleting(a)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      <ConfirmDialog open={creating} title="New announcement" confirmLabel="Create" confirmDisabled={!draft.title.trim() || !draft.body.trim()}
        onCancel={() => setCreating(false)}
        onConfirm={() => createAnnouncement(draft).then((a) => { setItems((all) => [a, ...all]); setDraft({ title: "", body: "" }); setCreating(false); }).catch(fail)}>
        <label className="block">Title<input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="mt-1 w-full rounded-md border px-2 py-1" /></label>
        <label className="mt-2 block">Message<textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} className="mt-1 w-full rounded-md border px-2 py-1" /></label>
      </ConfirmDialog>
      <ConfirmDialog open={!!deleting} tone="danger" title={`Delete "${deleting?.title}"?`} confirmLabel="Delete" onCancel={() => setDeleting(null)}
        onConfirm={() => { const d = deleting!; setDeleting(null); deleteAnnouncement(d.id).then(() => setItems((all) => all.filter((x) => x.id !== d.id))).catch(fail); }} />
    </div>
  );
}
