import SystemHealth from "@/components/admin/system-health";

export default function AdminSystemHealthPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">System health</h1>
      <SystemHealth />
    </div>
  );
}
