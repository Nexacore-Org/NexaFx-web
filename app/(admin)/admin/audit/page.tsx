import { getAuditLog } from "@/lib/api/admin";
import AuditLogTable from "@/components/admin/audit-log-table";

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    action?: string;
    targetType?: string;
    actorEmail?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const action = params.action ?? "";
  const targetType = params.targetType ?? "";
  const actorEmail = params.actorEmail ?? "";

  const { entries, total, pageSize } = await getAuditLog({
    page,
    action,
    targetType,
    actorEmail,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const baseQuery = `${action ? `&action=${encodeURIComponent(action)}` : ""}${targetType ? `&targetType=${encodeURIComponent(targetType)}` : ""}${actorEmail ? `&actorEmail=${encodeURIComponent(actorEmail)}` : ""}`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Audit log</h1>

      <form className="flex flex-wrap gap-3" method="get">
        <input
          type="text"
          name="action"
          placeholder="Action"
          defaultValue={action}
          className="rounded-md border px-3 py-1.5 text-sm"
        />
        <input
          type="text"
          name="targetType"
          placeholder="Target type"
          defaultValue={targetType}
          className="rounded-md border px-3 py-1.5 text-sm"
        />
        <input
          type="email"
          name="actorEmail"
          placeholder="Actor email"
          defaultValue={actorEmail}
          className="rounded-md border px-3 py-1.5 text-sm"
        />
        <button type="submit" className="rounded-md border px-3 py-1.5 text-sm">
          Apply filters
        </button>
      </form>

      <AuditLogTable entries={entries} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <a
            href={`/admin/audit?page=${Math.max(1, page - 1)}${baseQuery}`}
            className="rounded-md border px-3 py-1.5 text-sm"
          >
            Previous
          </a>
          <a
            href={`/admin/audit?page=${Math.min(totalPages, page + 1)}${baseQuery}`}
            className="rounded-md border px-3 py-1.5 text-sm"
          >
            Next
          </a>
        </div>
      </div>
    </div>
  );
}
