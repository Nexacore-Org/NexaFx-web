import DisputeTable from "@/components/admin/dispute-table";
import { getDisputes } from "@/lib/api/admin-ops";

export default async function AdminDisputesPage() {
  const disputes = await getDisputes();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Disputes</h1>
      <DisputeTable initial={disputes} />
    </div>
  );
}
