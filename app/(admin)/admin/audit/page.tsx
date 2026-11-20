import { getAuditLog } from "@/lib/api/admin";
import AuditLogTable from "@/components/admin/audit-log-table";
import AdminPagination from "@/components/admin/pagination";

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    action?: string;
    targetType?: string;
    actorEmail?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const action = params.action ?? "";
  const targetType = params.targetType ?? "";
  const actorEmail = params.actorEmail ?? "";
  const from = params.from ?? "";
  const to = params.to ?? "";

  const { entries, total, pageSize } = await getAuditLog({
    page,
    action,
    targetType,
    actorEmail,
    from,
    to,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Audit log</h1>

      <form className="flex flex-wrap items-end gap-3 text-sm" method="get">
        <label className="flex flex-col gap-1">
          Action
          <input type="text" name="action" defaultValue={action} className="rounded-md border px-3 py-1.5" />
        </label>
        <label className="flex flex-col gap-1">
          Target type
          <input type="text" name="targetType" defaultValue={targetType} className="rounded-md border px-3 py-1.5" />
        </label>
        <label className="flex flex-col gap-1">
          Actor email
          <input type="email" name="actorEmail" defaultValue={actorEmail} className="rounded-md border px-3 py-1.5" />
        </label>
        <label className="flex flex-col gap-1">
          From
          <input type="date" name="from" defaultValue={from} className="rounded-md border px-3 py-1.5" />
        </label>
        <label className="flex flex-col gap-1">
          To
          <input type="date" name="to" defaultValue={to} className="rounded-md border px-3 py-1.5" />
        </label>
        <button type="submit" className="rounded-md border px-3 py-1.5">
          Apply filters
        </button>
      </form>

      <AuditLogTable entries={entries} />

      <AdminPagination
        basePath="/admin/audit"
        params={params}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
