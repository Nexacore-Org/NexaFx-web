"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Trash2, Clock, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { getSchedules, deleteSchedule, toggleSchedule, type Schedule } from "@/lib/api/schedules";
import { ScheduleForm } from "@/components/dashboard/schedules/schedule-form";

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSchedules();
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleToggle = async (schedule: Schedule) => {
    try {
      setProcessing(schedule.id);
      await toggleSchedule(schedule.id, !schedule.isActive);
      setSchedules(prev =>
        prev.map(s => s.id === schedule.id ? { ...s, isActive: !s.isActive } : s)
      );
    } catch (err) {
      console.error("Failed to toggle schedule", err);
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setProcessing(id);
      await deleteSchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete schedule", err);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Schedules</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create schedule
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {schedules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No schedules yet</p>
          <p className="text-sm text-gray-400 mt-1">Create a recurring transfer to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {schedules.map(schedule => (
            <div
              key={schedule.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                  schedule.type === "Convert"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-purple-50 text-purple-600"
                }`}>
                  {schedule.type === "Convert" ? "C" : "W"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      schedule.type === "Convert"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {schedule.type}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${schedule.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {schedule.amount.toLocaleString()} {schedule.fromCurrency}
                    {schedule.toCurrency ? ` → ${schedule.toCurrency}` : ""}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {schedule.frequency} · Next: {new Date(schedule.nextRunAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={schedule.isActive}
                  onCheckedChange={() => handleToggle(schedule)}
                  disabled={processing === schedule.id}
                />
                {deleteConfirm === schedule.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      disabled={processing === schedule.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      {processing === schedule.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(schedule.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ScheduleForm
          onClose={() => setShowForm(false)}
          onSuccess={loadSchedules}
        />
      )}
    </div>
  );
}
