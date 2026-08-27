"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { getPlatformConfig, updatePlatformConfig, type PlatformConfig } from "@/lib/api/admin";

const DEFAULT_CURRENCIES = ["NGN", "USD", "EUR", "GBP"];

export default function ConfigPage() {
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [newCurrency, setNewCurrency] = useState("");

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await getPlatformConfig();
      setConfig(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const update = async (section: string, updates: Partial<PlatformConfig>) => {
    if (!config) return;
    try {
      setSaving(section);
      const result = await updatePlatformConfig(updates);
      setConfig(result);
      showSuccess(`${section} updated successfully`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(null);
    }
  };

  const addCurrency = () => {
    if (!config || !newCurrency.trim()) return;
    const curr = newCurrency.trim().toUpperCase();
    if (config.supportedCurrencies.includes(curr)) return;
    update("Currencies", {
      supportedCurrencies: [...config.supportedCurrencies, curr],
    });
    setNewCurrency("");
  };

  const removeCurrency = (curr: string) => {
    if (!config) return;
    update("Currencies", {
      supportedCurrencies: config.supportedCurrencies.filter((c) => c !== curr),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-600 max-w-lg mx-auto mt-10">
        <p className="font-semibold">{error}</p>
        <button onClick={loadConfig} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
          Retry
        </button>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="space-y-8 max-w-3xl">
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Supported Currencies */}
      <Section title="Supported Currencies">
        <div className="flex flex-wrap gap-2 mb-3">
          {config.supportedCurrencies.map((curr) => (
            <span key={curr} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
              {curr}
              <button onClick={() => removeCurrency(curr)} className="text-gray-400 hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add currency (e.g. GBP)"
            value={newCurrency}
            onChange={(e) => setNewCurrency(e.target.value.toUpperCase())}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={addCurrency}
            disabled={saving === "Currencies"}
            className="flex items-center gap-1 px-4 py-2 bg-yellow-400 text-black rounded-lg text-sm font-semibold hover:bg-yellow-500 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </Section>

      {/* Registration Toggle */}
      <Section title="Registration">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">New user registration</span>
          <button
            onClick={() =>
              update("Registration", {
                newUserRegistrationEnabled: !config.newUserRegistrationEnabled,
              })
            }
            disabled={saving === "Registration"}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.newUserRegistrationEnabled ? "bg-green-500" : "bg-gray-300"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.newUserRegistrationEnabled ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>
      </Section>

      {/* KYC Toggles */}
      <Section title="KYC Requirements">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">KYC required for withdrawal</span>
            <button
              onClick={() =>
                update("KYC", {
                  kycRequiredForWithdrawal: !config.kycRequiredForWithdrawal,
                })
              }
              disabled={saving === "KYC"}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.kycRequiredForWithdrawal ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.kycRequiredForWithdrawal ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">KYC required for conversion</span>
            <button
              onClick={() =>
                update("KYC", {
                  kycRequiredForConversion: !config.kycRequiredForConversion,
                })
              }
              disabled={saving === "KYC"}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.kycRequiredForConversion ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.kycRequiredForConversion ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>
        </div>
      </Section>

      {/* Transaction Limits */}
      <Section title="Transaction Limits">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Max daily transactions per user</span>
          <input
            type="number"
            value={config.maxDailyTransactionsPerUser}
            onChange={(e) =>
              setConfig({ ...config, maxDailyTransactionsPerUser: parseInt(e.target.value) || 0 })
            }
            className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm text-right"
          />
        </div>
        <button
          onClick={() => update("Limits", { maxDailyTransactionsPerUser: config.maxDailyTransactionsPerUser })}
          disabled={saving === "Limits"}
          className="mt-3 px-4 py-2 bg-yellow-400 text-black rounded-lg text-sm font-semibold hover:bg-yellow-500 disabled:opacity-50"
        >
          {saving === "Limits" ? "Saving..." : "Save"}
        </button>
      </Section>

      {/* Support Email */}
      <Section title="Support Email">
        <input
          type="email"
          value={config.supportEmail}
          onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={() => update("Support", { supportEmail: config.supportEmail })}
          disabled={saving === "Support"}
          className="mt-3 px-4 py-2 bg-yellow-400 text-black rounded-lg text-sm font-semibold hover:bg-yellow-500 disabled:opacity-50"
        >
          {saving === "Support" ? "Saving..." : "Save"}
        </button>
      </Section>

      {/* Default Language */}
      <Section title="Default Language">
        <select
          value={config.defaultLanguage}
          onChange={(e) => setConfig({ ...config, defaultLanguage: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
          <option value="de">German</option>
          <option value="pt">Portuguese</option>
        </select>
        <button
          onClick={() => update("Language", { defaultLanguage: config.defaultLanguage })}
          disabled={saving === "Language"}
          className="mt-3 px-4 py-2 bg-yellow-400 text-black rounded-lg text-sm font-semibold hover:bg-yellow-500 disabled:opacity-50"
        >
          {saving === "Language" ? "Saving..." : "Save"}
        </button>
      </Section>

      <p className="text-xs text-gray-400 text-right">Last updated: {new Date(config.updatedAt).toLocaleString()}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}
