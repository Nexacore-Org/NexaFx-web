import { apiRequest } from "../api-client";

const api = (path: string) => `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "/api"}${path}`;
const str = (v: unknown, d = "") => (typeof v === "string" ? v : d);

export interface Dispute { id: string; transactionId: string; reason: string; status: string; notes: string[]; createdAt: string }
export interface Announcement { id: string; title: string; body: string; active: boolean; createdAt: string }
export interface Broadcast { id: string; subject: string; body: string; audience: string; status: string; sentAt: string }
type Raw = Record<string, unknown>;

export const normaliseDispute = (d: Raw): Dispute => ({
  id: str(d.id), transactionId: str(d.transactionId), reason: str(d.reason), status: str(d.status, "open"),
  notes: Array.isArray(d.notes) ? d.notes.map((n) => str(typeof n === "string" ? n : (n as Raw)?.text)) : [], createdAt: str(d.createdAt),
});
export const normaliseAnnouncement = (a: Raw): Announcement => ({
  id: str(a.id), title: str(a.title), body: str(a.body), active: a.active === true, createdAt: str(a.createdAt),
});
export const normaliseBroadcast = (b: Raw): Broadcast => ({
  id: str(b.id), subject: str(b.subject), body: str(b.body), audience: str(b.audience, "all"), status: str(b.status, "queued"), sentAt: str(b.sentAt),
});

const list = async <T,>(path: string, key: string, norm: (r: Raw) => T) =>
  ((await apiRequest<Record<string, Raw[] | undefined>>(api(path)))[key] ?? []).map(norm);
const send = <T,>(path: string, method: "POST" | "PATCH" | "DELETE", body?: unknown) =>
  apiRequest<T>(api(path), { method, body });

// Disputes (#1224)
export const getDisputes = () => list("/admin/disputes", "disputes", normaliseDispute);
export const resolveDispute = async (id: string, resolution: "refund" | "reject", note?: string) =>
  normaliseDispute(await send<Raw>(`/admin/disputes/${id}/resolve`, "POST", { resolution, note }));
export const addDisputeNote = async (id: string, text: string) =>
  normaliseDispute(await send<Raw>(`/admin/disputes/${id}/notes`, "POST", { text }));

// Announcements (#1225)
export const getAnnouncements = () => list("/admin/announcements", "announcements", normaliseAnnouncement);
export const createAnnouncement = async (input: { title: string; body: string }) =>
  normaliseAnnouncement(await send<Raw>("/admin/announcements", "POST", input));
export const toggleAnnouncement = async (id: string, active: boolean) =>
  normaliseAnnouncement(await send<Raw>(`/admin/announcements/${id}`, "PATCH", { active }));
export const deleteAnnouncement = (id: string) => send<void>(`/admin/announcements/${id}`, "DELETE");

// Broadcast email (#1226)
export const getBroadcastEmails = () => list("/admin/broadcasts", "broadcasts", normaliseBroadcast);
export const sendBroadcastEmail = async (input: { subject: string; body: string; audience: string }) =>
  normaliseBroadcast(await send<Raw>("/admin/broadcasts", "POST", input));
export const deleteBroadcastEmail = (id: string) => send<void>(`/admin/broadcasts/${id}`, "DELETE");
