export default function StatusPage() {
  // TODO: Replace static status with live API when available
  const systems = [
    { name: 'Deposits', status: 'Operational' },
    { name: 'Withdrawals', status: 'Operational' },
    { name: 'Conversions', status: 'Operational' },
    { name: 'Exchange Rates', status: 'Operational' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-4">System Status</h1>
      <p className="text-sm text-gray-600 mb-6">This page shows a high-level system status. Data is static until backend status API is available (TODO).</p>

      <div className="grid grid-cols-1 gap-4">
        {systems.map((s) => (
          <div key={s.name} className="flex items-center justify-between bg-white p-4 rounded-lg border">
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-gray-500">Monitored component</div>
            </div>
            <div className="text-sm text-green-600">{s.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
