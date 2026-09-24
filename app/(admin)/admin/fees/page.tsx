"use client";

import { useState, useEffect } from "react";
import {
  getFeeConfig,
  updateFeeConfig,
  type FeeConfig,
} from "@/lib/api/admin";
import { formatDateTime } from "@/lib/utils/format";
import { Save, RotateCcw, DollarSign, Percent, ArrowUpDown } from "lucide-react";

const FEE_FIELDS = [
  { key: "conversionFeePercent", label: "Conversion Fee (%)", icon: Percent, step: "0.01", min: "0", max: "100" },
  { key: "withdrawalFlatFee", label: "Withdrawal Flat Fee", icon: DollarSign, step: "0.01", min: "0" },
  { key: "withdrawalFlatFeeCurrency", label: "Withdrawal Fee Currency", icon: DollarSign, step: undefined, min: undefined },
  { key: "minimumConversionAmount", label: "Min Conversion Amount", icon: ArrowUpDown, step: "0.01", min: "0" },
  { key: "maximumConversionAmount", label: "Max Conversion Amount", icon: ArrowUpDown, step: "0.01", min: "0" },
  { key: "minimumWithdrawalAmount", label: "Min Withdrawal Amount", icon: ArrowUpDown, step: "0.01", min: "0" },
  { key: "maximumWithdrawalAmount", label: "Max Withdrawal Amount", icon: ArrowUpDown, step: "0.01", min: "0" },
];

export default function FeesPage() {
  const [config, setConfig] = useState<FeeConfig | null>(null);
  const [editValues, setEditValues] = useState<Partial<FeeConfig>>({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getFeeConfig()
      .then((data) => {
        if (!cancelled) {
          setConfig(data);
          setEditValues({});
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to load fee configuration");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEdit = () => {
    if (!config) return;
    setEditValues({ ...config });
    setEditing(true);
    setSuccessMessage(null);
  };

  const handleCancel = () => {
    setEditValues({});
    setEditing(false);
    setSuccessMessage(null);
  };

  const handleChange = (key: string, value: string) => {
    setEditValues((prev) => ({
      ...prev,
      [key]: key === "withdrawalFlatFeeCurrency" ? value : Number(value),
    }));
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const changed: Partial<FeeConfig> = {};
    for (const key of Object.keys(editValues) as (keyof FeeConfig)[]) {
      if (editValues[key] !== undefined && editValues[key] !== config[key]) {
        (changed as Record<string, unknown>)[key] = editValues[key];
      }
    }

    if (Object.keys(changed).length === 0) {
      setEditing(false);
      setSaving(false);
      return;
    }

    const confirmMsg = "Are you sure you want to update the fee configuration?";
    if (!window.confirm(confirmMsg)) {
      setSaving(false);
      return;
    }

    try {
      const updated = await updateFeeConfig(changed);
      setConfig(updated);
      setEditValues({});
      setEditing(false);
      setSuccessMessage("Fee configuration updated successfully.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update fee configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-lg mx-auto mt-8">
        <p className="font-semibold">Error</p>
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

  const numericFields = FEE_FIELDS.filter((f) => f.key !== "withdrawalFlatFeeCurrency");
  const currencyField = FEE_FIELDS.find((f) => f.key === "withdrawalFlatFeeCurrency")!;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Fee Configuration</h2>
          {config?.updatedAt && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated {formatDateTime(config.updatedAt)} by {config.updatedBy || "unknown"}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#FFD552] text-sm font-semibold text-black hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="px-4 py-2 rounded-md bg-[#FFD552] text-sm font-semibold text-black hover:bg-yellow-500 transition-colors"
            >
              Edit Configuration
            </button>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Numeric fee cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {numericFields.map((field) => {
          const Icon = field.icon;
          const currentVal = config ? (config[field.key as keyof FeeConfig] ?? "") : "";
          const editVal = editing ? (editValues[field.key as keyof FeeConfig] ?? "") : currentVal;

          return (
            <div
              key={field.key}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Icon className="w-4 h-4 text-gray-600" />
                </div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {field.label}
                </p>
              </div>
              {editing ? (
                <input
                  type="number"
                  step={field.step}
                  min={field.min}
                  value={String(editVal ?? "")}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full text-lg font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              ) : (
                <p className="text-lg font-bold text-gray-900">
                  {String(currentVal ?? "")}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Currency field (text input) */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm max-w-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-gray-100">
            <DollarSign className="w-4 h-4 text-gray-600" />
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {currencyField.label}
          </p>
        </div>
        {editing ? (
          <input
            type="text"
            value={String(editValues[currencyField.key as keyof FeeConfig] ?? (config ? config.withdrawalFlatFeeCurrency : ""))}
            onChange={(e) => handleChange(currencyField.key, e.target.value)}
            className="w-full text-lg font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            maxLength={10}
          />
        ) : (
          <p className="text-lg font-bold text-gray-900">
            {config?.withdrawalFlatFeeCurrency ?? ""}
          </p>
        )}
      </div>

      {/* Audit trail */}
      {config?.updatedAt && (
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500">
            <span className="font-medium">Audit Trail:</span> Last modified by{" "}
            <span className="font-semibold text-gray-700">{config.updatedBy || "unknown"}</span> on{" "}
            {formatDateTime(config.updatedAt)}
          </p>
        </div>
      )}
    </div>
  );
}
