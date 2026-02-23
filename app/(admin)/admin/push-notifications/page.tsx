"use client";

import { useState, useMemo } from "react";
import { mockPushNotifications, PushNotification } from "@/lib/admin-mock-data";
import PushNotificationTable from "@/components/admin/push-notifications/PushNotificationTable";
import CreatePushNotificationModal from "@/components/admin/push-notifications/CreatePushNotificationModal";
import { Search, Plus } from "lucide-react";

export default function TransactionsPage() {
    const [notifications, setNotifications] = useState<PushNotification[]>(
        mockPushNotifications,
    );
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredData = useMemo(() => {
        return notifications.filter(
            (n) =>
                n.title.toLowerCase().includes(search.toLowerCase()) ||
                n.message.toLowerCase().includes(search.toLowerCase()),
        );
    }, [notifications, search]);

    const handleDeactivate = () => {
        setNotifications((prev) =>
            prev.map((n) =>
                selectedIds.includes(n.id) ? { ...n, status: "Inactive" } : n,
            ),
        );
        setSelectedIds([]);
    };

    const handleCreate = (title: string, message: string) => {
        const newNotification: PushNotification = {
            id: Date.now().toString(),
            title,
            message,
            status: "Active",
            createdAt: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
        };

        setNotifications((prev) => [newNotification, ...prev]);
    };

    return (
        <div className="md:p-6 space-y-6">
            {/* Top Bar */}
            <div className="flex flex-wrap justify-between items-center gap-4 boder">
                <div className="flex items-center gap-2 ps-3 py-1 bg-[#f5f5f5] text-[#595959] rounded-md min-w-64 w-full  md:max-w-70 lg:max-w-114">
                    <label htmlFor="notificationSearch">
                        <Search />
                    </label>
                    <input
                        type="text"
                        id="notificationSearch"
                        placeholder="Search"
                        className="outline-0 py-2 h-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />{" "}
                </div>

                <div className="flex gap-3 w-full  justify-end md:max-w-70 lg:max-w-100">
                    <button
                        disabled={selectedIds.length === 0}
                        onClick={handleDeactivate}
                        className="px-4 py-2 rounded-md bg-[#f0f0f0] border border-[#7c7c7c] text-black text-xs  font-semibold lg:text-sm disabled:opacity-50"
                    >
                        Deactivate
                    </button>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex gap-1.75 items-center px-1.5 py-1.5 rounded-md bg-[#FFD552] text-black text-xs font-semibold lg:hidden"
                    >
                        <Plus className="w-3.5" /> Create new
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 rounded-md bg-[#FFD552] text-sm text-black font-semibold hidden lg:flex gap-2.5"
                    >
                        <Plus className="w-3.5" /> Create a new push
                        notification
                    </button>
                </div>
            </div>

            <PushNotificationTable
                data={filteredData}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
            />

            {isModalOpen && (
                <CreatePushNotificationModal
                    onClose={() => setIsModalOpen(false)}
                    onCreate={handleCreate}
                />
            )}
        </div>
    );
}
