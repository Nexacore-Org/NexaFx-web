import { PushNotification } from "@/lib/admin-mock-data";

type Props = {
    data: PushNotification[];
    selectedIds: string[];
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function PushNotificationTable({
    data,
    selectedIds,
    setSelectedIds,
}: Props) {
    const toggleSelectAll = () => {
        if (selectedIds.length === data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(data.map((d) => d.id));
        }
    };

    const toggleRow = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    return (
        <div className="bg-white rounded-lg  overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left h-11 lg:h-16.5">
                    <tr>
                        <th className="p-3">
                            <input
                                type="checkbox"
                                checked={
                                    data.length > 0 &&
                                    selectedIds.length === data.length
                                }
                                onChange={toggleSelectAll}
                            />
                        </th>
                        <th className="py-3  font-bold text-[.55rem] md:text-sm">
                            TITLE
                        </th>
                        <th className="py-3  font-bold text-[.55rem] md:text-sm hidden md:table-cell">
                            MESSAGE
                        </th>
                        <th className="py-3  font-bold text-[.55rem] md:text-sm">
                            STATUS
                        </th>
                        <th className="py-3  font-bold text-[.55rem] md:text-sm">
                            DATE ADDED
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {data.map((row) => (
                        <tr key={row.id} className="border-t h-16 md:h-22 ">
                            <td className="p-3">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(row.id)}
                                    onChange={() => toggleRow(row.id)}
                                />
                            </td>
                            <td className="py-3 pe-3 font-semibold text-xs md:text-sm md:font-medium">
                                {row.title}
                                <div className="opacity-70 max-w-31 font-medium line-clamp-2 text-xs mt-1 md:hidden">
                                    {row.message}
                                </div>
                            </td>
                            <td className="py-3 pe-3 max-w-62.5 line-clamp-2 opacity-70 font-medium hidden md:table-cell md:text-xs">
                                <p className="line-clamp-2">
                                    {row.message}
                                </p>{" "}
                            </td>
                            <td className="py-3 pe-3 ">
                                <span
                                    className={`px-3 py-1 rounded-full  font-bold flex justify-center items-center w-16 mh-6 text-[.6rem] md:text-xs md:w-22 md:h-6 ${
                                        row.status === "Active"
                                            ? "bg-green-100 text-[#009411]"
                                            : "bg-red-100 text-[#940c00]"
                                    }`}
                                >
                                    {row.status}
                                </span>
                            </td>
                            <td className="py-3 pe-2 text-[.55rem] md:text-xs">
                                {row.createdAt}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
