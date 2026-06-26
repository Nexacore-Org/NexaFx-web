"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import PushNotificationTable from "@/components/admin/push-notifications/PushNotificationTable";
import CreatePushNotificationModal from "@/components/admin/push-notifications/CreatePushNotificationModal";
import {
  getAdminPushNotifications,
  createAdminPushNotification,
  type PushNotification,
} from "@/lib/api/admin";
import { getRequestErrorMessage, isOfflineError } from "@/lib/api-client";
import { Search, Plus } from "lucide-react";

export default function PushNotificationsPage() {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const cachedNotificationsRef = useRef<PushNotification[]>([]);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminPushNotifications();
        cachedNotificationsRef.current = data;
        setOfflineNotice(null);
        setNotifications(data);
      } catch (err: unknown) {
        console.error("Error fetching push notifications:", err);
        const hasCachedData = cachedNotificationsRef.current.length > 0;
        const message = getRequestErrorMessage(err, {
          fallback: "Failed to load push notifications.",
          hasCachedData,
        });

        if (isOfflineError(err) && hasCachedData) {
          setOfflineNotice(message);
        } else {
          setOfflineNotice(null);
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const filteredData = useMemo(() => {
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase()),
    );
  }, [notifications, search]);

  const handleDeactivate = () => {
    // Since backend does not explicitly support deactivate in simple REST, we simulate locally
    setNotifications((prev) =>
      prev.map((n) =>
        selectedIds.includes(n.id) ? { ...n, status: "Inactive" } : n,
      ),
    );
    setSelectedIds([]);
  };

  const handleCreate = async (title: string, message: string) => {
    try {
      const newNotification = await createAdminPushNotification({
        title,
        message,
      });
      setNotifications((prev) => [newNotification, ...prev]);
    } catch (err: unknown) {
      console.error("Error creating push notification:", err);
      alert(
        getRequestErrorMessage(err, {
          fallback: "Failed to create push notification.",
        }),
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-lg mx-auto mt-8">
        <p className="font-semibold">Error Loading Push Notifications</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-xs font-semibold underline hover:text-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="md:p-6 space-y-6">
      {offlineNotice && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {offlineNotice}
        </div>
      )}
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
            <Plus className="w-3.5" /> Create a new push notification
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
