"use client";

import { useState } from "react";
import { Pencil, Check, X, Clock } from "lucide-react";

type FeeConfig = {
  id: string;
  label: string;
  percentage: number;
  minFee: number;
  maxFee: number;
  currency: string;
  applicablePairs?: string[];
};

type Props = {
  title: string;
  icon: React.ReactNode;
  configs: FeeConfig[];
  isLoading: boolean;
};

export function FeeConfigSection({ title, icon, configs, isLoading }: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<FeeConfig>>({});

  const handleEdit = (config: FeeConfig) => {
    setEditId(config.id);
    setEditValues({
      percentage: config.percentage,
      minFee: config.minFee,
      maxFee: config.maxFee,
    });
  };

  const handleSave = (id: string) => {
    console.log("Save fee config", id, editValues);
    setEditId(null);
    setEditValues({});
  };

  const handleCancel = () => {
    setEditId(null);
    setEditValues({});
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-gray-200 rounded" />
          <div className="h-5 w-40 bg-gray-200 rounded" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-4 w-32 bg-gray-100 rounded" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-12 bg-gray-100 rounded-lg" />
              <div className="h-12 bg-gray-100 rounded-lg" />
              <div className="h-12 bg-gray-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      {configs.map((config) => {
        const isEditing = editId === config.id;
        return (
          <div
            key={config.id}
            className="border border-gray-100 rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                {config.label}
              </h4>
              {!isEditing ? (
                <button
                  onClick={() => handleEdit(config)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSave(config.id)}
                    className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Fee Percentage
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editValues.percentage ?? config.percentage}
                    onChange={(e) =>
                      setEditValues((prev) => ({
                        ...prev,
                        percentage: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">
                    {config.percentage}%
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Min Fee
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editValues.minFee ?? config.minFee}
                    onChange={(e) =>
                      setEditValues((prev) => ({
                        ...prev,
                        minFee: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">
                    {config.currency} {config.minFee.toFixed(2)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Max Fee
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editValues.maxFee ?? config.maxFee}
                    onChange={(e) =>
                      setEditValues((prev) => ({
                        ...prev,
                        maxFee: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">
                    {config.currency} {config.maxFee.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {config.applicablePairs && config.applicablePairs.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">Applicable:</span>
                {config.applicablePairs.map((pair) => (
                  <span
                    key={pair}
                    className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                  >
                    {pair}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

type HistoryEntry = {
  id: string;
  action: string;
  field: string;
  oldValue: string;
  newValue: string;
  updatedBy: string;
  updatedAt: string;
};

type UpdateHistoryProps = {
  entries: HistoryEntry[];
  isLoading: boolean;
};

export function UpdateHistory({ entries, isLoading }: UpdateHistoryProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3 animate-pulse">
        <div className="h-5 w-36 bg-gray-200 rounded" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900">
          Update History
        </h3>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-400">No updates recorded yet.</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border border-gray-100 rounded-lg p-3 text-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900">
                  {entry.action}
                </span>
                <span className="text-xs text-gray-400">{entry.updatedAt}</span>
              </div>
              <p className="text-gray-500 text-xs">
                {entry.field}: {entry.oldValue} → {entry.newValue}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                by {entry.updatedBy}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
