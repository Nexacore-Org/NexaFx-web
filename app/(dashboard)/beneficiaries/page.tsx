"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  X,
  Check,
  Users,
  Search,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getBeneficiaries,
  createBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
  CreateBeneficiarySchema,
  BENEFICIARIES_ENABLED,
  type Beneficiary,
  type CreateBeneficiaryDto,
} from "@/lib/api/beneficiaries";
import { toast } from "@/hooks/use-toast-store";
import { haptics } from "@/lib/utils/haptics";

function DeleteConfirmDialog({
  name,
  onConfirm,
  onCancel,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm space-y-4 shadow-xl">
        <h3 className="text-base font-semibold text-foreground">
          Delete recipient?
        </h3>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{name}</span> will be
          permanently removed from your saved recipients.
        </p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CreateBeneficiaryDto>({
    resolver: zodResolver(CreateBeneficiarySchema),
    defaultValues: { name: "", address: "", memo: "", currency: "USDC" },
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const list = await getBeneficiaries();
      setBeneficiaries(list);
    } catch {
      setLoadError("Unable to load saved recipients. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpenAdd = () => {
    setEditingId(null);
    resetForm({ name: "", address: "", memo: "", currency: "USDC" });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (b: Beneficiary) => {
    setEditingId(b.id);
    setValue("name", b.name);
    setValue("address", b.address);
    setValue("memo", b.memo ?? "");
    setValue("currency", b.currency);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const onSubmit = async (data: CreateBeneficiaryDto) => {
    try {
      if (editingId) {
        const updated = await updateBeneficiary(editingId, data);
        setBeneficiaries((prev) =>
          prev.map((b) => (b.id === editingId ? updated : b)),
        );
        toast("Recipient updated", "success");
      } else {
        const created = await createBeneficiary(data);
        setBeneficiaries((prev) => [...prev, created]);
        toast("Recipient saved", "success");
      }
      handleCloseForm();
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Failed to save recipient",
        "error",
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBeneficiary(id);
      setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
      toast("Recipient deleted", "success");
      haptics.light();
    } catch {
      toast("Failed to delete recipient", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    haptics.light();
    toast("Address copied", "success");
  };

  const filtered = beneficiaries.filter(
    (b) =>
      !query ||
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.address.toLowerCase().includes(query.toLowerCase()),
  );

  if (!BENEFICIARIES_ENABLED) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Users className="size-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground">
            Saved Recipients
          </h1>
        </div>
        <div className="text-center py-16 text-muted-foreground">
          <Users className="size-12 mx-auto mb-4 opacity-40" />
          <p className="text-sm">
            Saved recipients are not yet available. Check back soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {deletingId && (
        <DeleteConfirmDialog
          name={beneficiaries.find((b) => b.id === deletingId)?.name ?? ""}
          onConfirm={() => handleDelete(deletingId)}
          onCancel={() => setDeletingId(null)}
        />
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="size-6 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Saved Recipients
            </h1>
            <p className="text-sm text-muted-foreground">
              Save frequent withdrawal destinations
            </p>
          </div>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" />
          Add
        </button>
      </div>

      {/* Add / Edit form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-muted/50 border border-border rounded-xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              {editingId ? "Edit Recipient" : "New Recipient"}
            </h2>
            <button
              type="button"
              onClick={handleCloseForm}
              className="p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Close form"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Name *
              </label>
              <input
                {...register("name")}
                placeholder="e.g. My savings wallet"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Stellar Address *
              </label>
              <input
                {...register("address")}
                placeholder="G…"
                className="w-full px-3 py-2 text-sm font-mono bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {errors.address && (
                <p className="text-xs text-destructive mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Currency *
                </label>
                <select
                  {...register("currency")}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="USDC">USDC</option>
                  <option value="XLM">XLM</option>
                  <option value="USD">USD</option>
                  <option value="NGN">NGN</option>
                </select>
                {errors.currency && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.currency.message}
                  </p>
                )}
              </div>

              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Memo (optional)
                </label>
                <input
                  {...register("memo")}
                  placeholder="Memo text"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Check className="size-4" />
            {isSubmitting
              ? "Saving…"
              : editingId
                ? "Save Changes"
                : "Add Recipient"}
          </button>
        </form>
      )}

      {/* Search */}
      {beneficiaries.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipients…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : loadError ? (
        <div className="text-center py-8">
          <p className="text-sm text-destructive">{loadError}</p>
          <button
            onClick={load}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 && query ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No recipients match &quot;{query}&quot;</p>
        </div>
      ) : beneficiaries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="size-12 mx-auto mb-4 opacity-40" />
          <p className="text-sm">No saved recipients yet.</p>
          <p className="text-xs mt-1">
            Add one to quickly fill in withdrawal details.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((b) => {
            const isExpanded = expandedId === b.id;
            return (
              <div
                key={b.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : b.id)
                  }
                  className="w-full flex items-center justify-between p-4 text-left"
                  aria-expanded={isExpanded}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {b.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                      {b.address.slice(0, 12)}…{b.address.slice(-6)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {b.currency}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 space-y-3 border-t border-border/50">
                    {/* Full address with copy */}
                    <div className="flex items-start justify-between gap-2 p-2 bg-muted/40 rounded-lg">
                      <p className="text-xs font-mono text-muted-foreground break-all">
                        {b.address}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopyAddress(b.address)}
                        aria-label="Copy address"
                        className="flex-shrink-0 p-1 rounded-md hover:bg-muted transition-colors"
                      >
                        <Copy className="size-3.5 text-muted-foreground" />
                      </button>
                    </div>

                    {b.memo && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Memo</span>
                        <span className="font-medium text-foreground">
                          {b.memo}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(b)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors"
                      >
                        <Edit3 className="size-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(b.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
