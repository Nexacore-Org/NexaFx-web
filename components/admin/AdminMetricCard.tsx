import { LucideIcon } from "lucide-react";

type Props = {
    label: string;
    value: number | string;
    icon: LucideIcon;
};

export function AdminMetricCard({ label, value, icon: Icon }: Props) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex items-center gap-4 flex-1 min-w-0">
            <Icon className="w-[25px] h-[25px] shrink-0 text-gray-500" />
            <div className="min-w-0">
                <p className="text-sm text-gray-500 truncate">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">
                    {typeof value === "number" ? value.toLocaleString() : value}
                </p>
            </div>
        </div>
    );
}
