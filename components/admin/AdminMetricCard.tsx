import Image from "next/image";

type Props = {
    label: string;
    value: number | string;
    iconSrc: string;
};

export function AdminMetricCard({ label, value, iconSrc }: Props) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex items-center gap-4 flex-1 min-w-0">
            <Image src={iconSrc} alt={label} width={25} height={25} className="shrink-0" />
            <div className="min-w-0">
                <p className="text-sm text-gray-500 truncate">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">
                    {typeof value === "number" ? value.toLocaleString() : value}
                </p>
            </div>
        </div>
    );
}
