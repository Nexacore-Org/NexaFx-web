"use client";

import { useEffect, useState } from "react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { getBroadcastEmails, sendBroadcastEmail, type Broadcast } from "@/lib/api/admin-ops";

export default function AdminBroadcastPage() {
  const [past, setPast] = useState<Broadcast[]>([]);
  const [draft, setDraft] = useState({ subject: "", body: "", audience: "all" });
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  useEffect(() => { getBroadcastEmails().then(setPast).catch(() => setStatus("Could not load past broadcasts.")); }, []);

  async function send() {
    setConfirming(false);
    setStatus("Sending…");
    try {
      const sent = await sendBroadcastEmail(draft);
      setPast((p) => [sent, ...p]);
      setDraft({ subject: "", body: "", audience: "all" });
      setStatus(`Broadcast ${sent.status}.`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Send failed.");
    }
  }

  return (
    <div className="space-y-6 text-sm">
      <h1 className="text-2xl font-semibold">Broadcast email</h1>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setConfirming(true); }}>
        <label className="block">Subject<input required value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} className="mt-1 w-full rounded-md border px-2 py-1" /></label>
        <label className="block">Body<textarea required rows={6} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} className="mt-1 w-full rounded-md border px-2 py-1" /></label>
        <label className="block">Audience
          <select value={draft.audience} onChange={(e) => setDraft({ ...draft, audience: e.target.value })} className="mt-1 rounded-md border px-2 py-1">
            <option value="all">All users</option><option value="verified">Verified users</option><option value="unverified">Unverified users</option>
          </select>
        </label>
        <button type="submit" className="rounded-md border px-3 py-1.5">Review and send</button>
      </form>
      {status && <p role="status">{status}</p>}
      <ul className="space-y-2">{past.map((b) => <li key={b.id} className="rounded-lg border p-3"><p className="font-medium">{b.subject}</p><p className="text-muted-foreground">{b.audience} · {b.status} · {b.sentAt || "-"}</p></li>)}</ul>
      <ConfirmDialog open={confirming} title={`Send "${draft.subject}" to ${draft.audience}?`} description="This email goes out immediately and cannot be recalled." confirmLabel="Send" onCancel={() => setConfirming(false)} onConfirm={() => void send()} />
    </div>
  );
}
