import type { CohortRetentionData } from "@/lib/api/admin";

type Props = {
  cohorts: CohortRetentionData[];
};

function formatCohortMonth(value: string) {
  const [year, month] = value.split("-");
  if (!year || !month) return value;

  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getRetentionCellClass(value: number) {
  if (value >= 80) return "bg-emerald-700 text-white";
  if (value >= 60) return "bg-emerald-500 text-white";
  if (value >= 40) return "bg-emerald-200 text-emerald-950";
  if (value > 0) return "bg-amber-100 text-amber-900";
  return "bg-gray-50 text-gray-400";
}

export function CohortRetentionTable({ cohorts }: Props) {
  const maxMonths = Math.max(0, ...cohorts.map((cohort) => cohort.retentionByMonth.length));

  if (cohorts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 text-sm text-gray-500">
        No cohort retention data available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Cohort Retention</h3>
        <p className="text-sm text-gray-500 mt-1">
          Data loaded from GET /admin/analytics/cohort-retention.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Cohort
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Size
              </th>
              {Array.from({ length: maxMonths }, (_, index) => (
                <th
                  key={index}
                  className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  Month {index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((cohort) => {
              const label = formatCohortMonth(cohort.cohortMonth);

              return (
                <tr key={cohort.cohortMonth} className="border-b border-gray-50 last:border-0">
                  <td className="px-6 py-4 font-semibold text-gray-900">{label}</td>
                  <td className="px-4 py-4 text-gray-600">{cohort.cohortSize.toLocaleString()}</td>
                  {Array.from({ length: maxMonths }, (_, index) => {
                    const value = cohort.retentionByMonth[index];

                    return (
                      <td key={index} className="px-3 py-3 text-center">
                        {value === undefined ? (
                          <span className="text-gray-300">-</span>
                        ) : (
                          <span
                            className={`inline-flex min-w-14 justify-center rounded px-2 py-1 font-semibold ${getRetentionCellClass(value)}`}
                            title={`${value}% of ${label} users were active in Month ${index + 1}`}
                          >
                            {value}%
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
