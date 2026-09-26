import { LucideIcon } from "lucide-react";

type Props = {
    label: string;
    value: number | string;
    icon: LucideIcon;
    isMonetary?: boolean;
};

export function AdminMetricCard({ label, value, icon: Icon, isMonetary = false }: Props) {
    const formattedValue =
        typeof value === "number"
            ? isMonetary
                ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  }).format(value)
                : value.toLocaleString()
            : value;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex items-center gap-4 flex-1 min-w-0">
            <Icon className="w-[25px] h-[25px] shrink-0 text-gray-500" />
            <div className="min-w-0">
                <p className="text-sm text-gray-500 truncate">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">
                    {formattedValue}
                </p>
            </div>
        </div>
    );
}
