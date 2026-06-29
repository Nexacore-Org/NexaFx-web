"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { createSchedule, type ScheduleFrequency, type ScheduleType } from "@/lib/api/schedules";

interface ScheduleFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ScheduleForm({ onClose, onSuccess }: ScheduleFormProps) {
  const [type, setType] = useState<ScheduleType>("Convert");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("NGN");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<ScheduleFrequency>("monthly");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (type === "Withdraw" && !destinationAddress.trim()) {
      setError("Please enter a destination address");
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      await createSchedule({
        type,
        fromCurrency,
        toCurrency: type === "Convert" ? toCurrency : undefined,
        amount: Number(amount),
        frequency,
        isActive,
        destinationAddress: type === "Withdraw" ? destinationAddress.trim() : undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create schedule");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-xl z-50 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create Schedule</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Type</label>
            <div className="flex gap-3 mt-1">
              {(["Convert", "Withdraw"] as ScheduleType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    type === t
                      ? "bg-yellow-400 border-yellow-400 text-black"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">From Currency</label>
              <input
                type="text"
                value={fromCurrency}
                onChange={e => setFromCurrency(e.target.value.toUpperCase())}
                placeholder="USD"
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>

          {type === "Convert" ? (
            <div>
              <label className="text-sm font-medium text-gray-700">To Currency</label>
              <input
                type="text"
                value={toCurrency}
                onChange={e => setToCurrency(e.target.value.toUpperCase())}
                placeholder="NGN"
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-gray-700">Destination Address</label>
              <input
                type="text"
                value={destinationAddress}
                onChange={e => setDestinationAddress(e.target.value)}
                placeholder="Wallet address"
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Frequency</label>
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value as ScheduleFrequency)}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Active on creation</label>
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {processing ? "Creating..." : "Create Schedule"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
