"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Plus, Trash2 } from "lucide-react";
import {
  getAnnouncements,
  createAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
  type Announcement,
} from "@/lib/api/admin";
import CreateAnnouncementModal from "./create-announcement-modal";

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const cachedRef = useRef<Announcement[]>([]);

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        const data = await getAnnouncements();
        cachedRef.current = data;
        setAnnouncements(data);
      } catch (err) {
        console.error("Failed to load announcements:", err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const filtered = useMemo(() => {
    return announcements.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.message.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [announcements, search, statusFilter]);

  const handleCreate = async (data: {
    title: string;
    message: string;
    colorTheme: string;
    targetPage: string;
  }) => {
    try {
      const newAnnouncement = await createAnnouncement(data);
      setAnnouncements((prev) => [newAnnouncement, ...prev]);
    } catch (err) {
      console.error("Failed to create announcement:", err);
      alert("Failed to create announcement.");
    }
  };

  const handleToggle = async (id: string, currentStatus: "Active" | "Inactive") => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      await toggleAnnouncement(id, newStatus);
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
      );
    } catch (err) {
      console.error("Failed to toggle announcement:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete announcement:", err);
      alert("Failed to delete announcement.");
    }
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
      </div>
    );
  }

  return (
    <div className="md:p-6 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2 ps-3 py-1 bg-[#f5f5f5] text-[#595959] rounded-md min-w-64 w-full md:max-w-70 lg:max-w-114">
          <label htmlFor="announcementSearch">
            <Search />
          </label>
          <input
            type="text"
            id="announcementSearch"
            placeholder="Search"
            className="outline-0 py-2 h-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-3 w-full justify-end md:max-w-70 lg:max-w-100">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "All" | "Active" | "Inactive")}
            className="px-3 py-2 rounded-md bg-[#f0f0f0] border border-[#7c7c7c] text-black text-xs font-semibold lg:text-sm"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex gap-1.75 items-center px-3 py-2 rounded-md bg-[#FFD552] text-black text-xs font-semibold"
          >
            <Plus className="w-3.5" /> Create
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-x-auto w-full max-w-[100vw]">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left h-11 lg:h-16.5">
            <tr>
              <th className="py-3 px-4 font-bold text-[.55rem] md:text-sm">TITLE</th>
              <th className="py-3 px-4 font-bold text-[.55rem] md:text-sm hidden md:table-cell">
                MESSAGE
              </th>
              <th className="py-3 px-4 font-bold text-[.55rem] md:text-sm">STATUS</th>
              <th className="py-3 px-4 font-bold text-[.55rem] md:text-sm">TARGET</th>
              <th className="py-3 px-4 font-bold text-[.55rem] md:text-sm">DATE</th>
              <th className="py-3 px-4 font-bold text-[.55rem] md:text-sm">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-t h-16 md:h-22">
                <td className="py-3 px-4 font-semibold text-xs md:text-sm md:font-medium">
                  {row.title}
                  <div className="opacity-70 max-w-31 font-medium line-clamp-2 text-xs mt-1 md:hidden">
                    {row.message}
                  </div>
                </td>
                <td className="py-3 px-4 max-w-62.5 line-clamp-2 opacity-70 font-medium hidden md:table-cell md:text-xs">
                  <p className="line-clamp-2">{row.message}</p>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleToggle(row.id, row.status)}
                    className={`px-3 py-1 rounded-full font-bold text-[.6rem] md:text-xs md:w-22 md:h-6 transition-colors ${
                      row.status === "Active"
                        ? "bg-green-100 text-[#009411]"
                        : "bg-red-100 text-[#940c00]"
                    }`}
                  >
                    {row.status}
                  </button>
                </td>
                <td className="py-3 px-4 text-[.55rem] md:text-xs capitalize">
                  {row.targetPage}
                </td>
                <td className="py-3 px-4 text-[.55rem] md:text-xs">
                  {row.createdAt}
                </td>
                <td className="py-3 px-4">
                  {deleteConfirm === row.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="text-xs text-red-600 font-semibold hover:underline"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(row.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-sm text-gray-400"
                >
                  No announcements found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <CreateAnnouncementModal
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
