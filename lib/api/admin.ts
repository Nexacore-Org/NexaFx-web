import { apiRequest } from "../api-client";

function toApiBase(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "/api";
  return `${base}${path}`;
}

export interface AdminAuditLogEntry {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface AdminAuditQuery {
  page?: number;
  pageSize?: number;
  action?: string;
  targetType?: string;
  actorEmail?: string;
  from?: string;
  to?: string;
}

export interface AdminAuditResponse {
  entries: AdminAuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getAuditLog(query: AdminAuditQuery): Promise<AdminAuditResponse> {
  const data = await apiRequest<Partial<AdminAuditResponse>>(
    toApiBase("/admin/audit-log"),
    {
      query: {
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 20,
        action: query.action ?? "",
        targetType: query.targetType ?? "",
        actorEmail: query.actorEmail ?? "",
        from: query.from ?? "",
        to: query.to ?? "",
      },
    },
  );
  return {
    entries: (data.entries ?? []).map((e) => ({
      id: e.id ?? "",
      actorId: e.actorId ?? "",
      actorEmail: e.actorEmail ?? "",
      action: e.action ?? "",
      targetType: e.targetType ?? "",
      targetId: e.targetId ?? "",
      metadata: e.metadata ?? null,
      createdAt: e.createdAt ?? "",
    })),
    total: data.total ?? 0,
    page: data.page ?? 1,
    pageSize: data.pageSize ?? 20,
  };
}
