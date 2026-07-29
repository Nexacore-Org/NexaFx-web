"use client";

import { useState, useEffect, useCallback } from "react";
import { getIpAllowlist, addIpToAllowlist, removeIpFromAllowlist, type AllowedIp } from "@/lib/api/admin";
import { Shield, Plus, Trash2, Loader2, AlertTriangle } from "lucide-react";

function isValidIp(value: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
  const ipv6Regex = /^([0-9a-fA-F:]+)(\/\d{1,3})?$/;
  return ipv4Regex.test(value) || ipv6Regex.test(value);
}

export default function SecurityPage() {
  const [allowlist, setAllowlist] = useState<AllowedIp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [ipInput, setIpInput] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [ipError, setIpError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchAllowlist = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getIpAllowlist();
      setAllowlist(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load IP allowlist");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllowlist();
  }, [fetchAllowlist]);

  const handleAdd = async () => {
    setIpError(null);
    if (!ipInput.trim()) {
      setIpError("IP address is required");
      return;
    }
    if (!isValidIp(ipInput.trim())) {
      setIpError("Enter a valid IPv4, IPv6, or CIDR notation");
      return;
    }
    setAdding(true);
    try {
      const newEntry = await addIpToAllowlist(ipInput.trim(), labelInput.trim() || "Unnamed");
      setAllowlist((prev) => [...prev, newEntry]);
      setIpInput("");
      setLabelInput("");
      setShowAddForm(false);
    } catch (err) {
      setIpError(err instanceof Error ? err.message : "Failed to add IP");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await removeIpFromAllowlist(id);
      setAllowlist((prev) => prev.filter((entry) => entry.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove IP");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Security</h1>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start gap-3">
        <AlertTriangle className="size-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">IP Allowlist Active</p>
          <p className="text-xs mt-0.5">
            Only requests from the IPs below can access the admin panel. Your current IP is automatically allowed.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-border/50 bg-card">
        <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Shield className="size-5 text-muted-foreground" />
            <h2 className="font-semibold text-base text-foreground">IP Allowlist</h2>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFD552] text-black text-sm font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
          >
            <Plus className="size-4" /> Add IP
          </button>
        </div>

        {showAddForm && (
          <div className="px-5 py-4 border-b border-border/50 bg-muted/30">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex-1 space-y-1 w-full sm:w-auto">
                <label className="text-xs font-medium text-muted-foreground">IP / CIDR</label>
                <input
                  value={ipInput}
                  onChange={(e) => { setIpInput(e.target.value); setIpError(null); }}
                  placeholder="192.168.1.0/24"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F39A00]"
                />
                {ipError && <p className="text-xs text-red-500">{ipError}</p>}
              </div>
              <div className="flex-1 space-y-1 w-full sm:w-auto">
                <label className="text-xs font-medium text-muted-foreground">Label</label>
                <input
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  placeholder="Office VPN"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F39A00]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={adding}
                  className="px-4 py-2 bg-[#FFD552] text-black text-sm font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                >
                  {adding ? <Loader2 className="size-4 animate-spin" /> : "Add"}
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setIpError(null); }}
                  className="px-4 py-2 border border-border text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : allowlist.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            No IP addresses in the allowlist.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">IP / CIDR</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Label</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Added By</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Added At</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allowlist.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/25 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-foreground">{entry.ip}</td>
                    <td className="px-5 py-3 text-foreground">{entry.label}</td>
                    <td className="px-5 py-3 text-muted-foreground">{entry.addedBy}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {new Date(entry.addedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {deleteConfirm === entry.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-muted-foreground">Confirm?</span>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            disabled={deleting === entry.id}
                            className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors"
                          >
                            {deleting === entry.id ? <Loader2 className="size-3 animate-spin" /> : "Yes"}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 border border-border text-xs font-medium rounded-md hover:bg-muted transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(entry.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                          aria-label="Remove IP"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
