"use client";

interface ReferralEntry {
  id: string;
  name: string;
  email: string;
  date: string;
  status: "active" | "inactive";
  reward: number;
}

const MOCK_REFERRALS: ReferralEntry[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    date: "2025-06-20",
    status: "active",
    reward: 50,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    date: "2025-06-18",
    status: "active",
    reward: 50,
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    date: "2025-06-15",
    status: "inactive",
    reward: 0,
  },
  {
    id: "4",
    name: "Sarah Williams",
    email: "sarah@example.com",
    date: "2025-06-10",
    status: "active",
    reward: 50,
  },
  {
    id: "5",
    name: "David Brown",
    email: "david@example.com",
    date: "2025-06-05",
    status: "active",
    reward: 50,
  },
];

export function ReferralTable() {
  if (MOCK_REFERRALS.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">
          No referrals yet. Share your referral link to start earning!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                Reward
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK_REFERRALS.map((ref) => (
              <tr
                key={ref.id}
                className="hover:bg-muted/20 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  {ref.name}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {ref.email}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {new Date(ref.date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      ref.status === "active"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {ref.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-right text-green-500">
                  +${ref.reward}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
