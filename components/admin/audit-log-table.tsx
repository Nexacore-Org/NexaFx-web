import type { AdminAuditLogEntry } from "@/lib/api/admin";

export default function AuditLogTable({ entries }: { entries: AdminAuditLogEntry[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left font-medium">Time</th>
            <th className="py-2 text-left font-medium">Actor</th>
            <th className="py-2 text-left font-medium">Action</th>
            <th className="py-2 text-left font-medium">Target</th>
            <th className="py-2 text-left font-medium">Metadata</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-muted-foreground">
                No audit entries found.
              </td>
            </tr>
          ) : (
            entries.map((e) => (
              <tr key={e.id} className="border-b align-top">
                <td className="py-2 whitespace-nowrap">
                  {e.createdAt ? new Date(e.createdAt).toLocaleString() : "-"}
                </td>
                <td className="py-2">{e.actorEmail || "-"}</td>
                <td className="py-2">{e.action}</td>
                <td className="py-2">
                  {e.targetType}
                  {e.targetId ? ` · ${e.targetId}` : ""}
                </td>
                <td className="py-2">
                  {e.metadata ? (
                    <pre className="max-w-xs truncate text-xs">
                      {JSON.stringify(e.metadata)}
                    </pre>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
