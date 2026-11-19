"use client";

import { useState } from "react";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { notify } from "@/lib/notify";

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
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    data: beneficiaries = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["beneficiaries"],
    queryFn: getBeneficiaries,
    enabled: BENEFICIARIES_ENABLED,
  });

  const loadError = isError
    ? "Unable to load saved recipients. Please try again."
    : null;

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
        await updateBeneficiary(editingId, data);
        notify.success("Recipient updated");
      } else {
        await createBeneficiary(data);
        notify.success("Recipient saved");
      }
      await queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      handleCloseForm();
    } catch (err) {
      notify.error(
        err instanceof Error ? err.message : "Failed to save recipient",
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBeneficiary(id);
      await queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      notify.success("Recipient deleted");
    } catch {
      notify.error("Failed to delete recipient");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    notify.success("Address copied");
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
                Address *
              </label>
              <input
                {...register("address")}
                placeholder="G..."
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
              />
              {errors.address && (
                <p className="text-xs text-destructive mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Memo (optional)
              </label>
              <input
                {...register("memo")}
                placeholder="e.g. Rent"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Currency
              </label>
              <select
                {...register("currency")}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="USDC">USDC</option>
                <option value="XLM">XLM</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleCloseForm}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      {beneficiaries.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipients..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : loadError ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">{loadError}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="size-12 mx-auto mb-4 opacity-40" />
          <p className="text-sm">
            {beneficiaries.length === 0
              ? "No saved recipients yet. Add one to get started."
              : "No recipients match your search."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((b) => {
            const isExpanded = expandedId === b.id;
            return (
              <li
                key={b.id}
                className="bg-card border border-border rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {b.name}
                      </p>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {b.currency}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                      {b.address}
                    </p>
                    {b.memo && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {b.memo}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopyAddress(b.address)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      aria-label="Copy address"
                    >
                      <Copy className="size-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      aria-label="Edit recipient"
                    >
                      <Edit3 className="size-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => setDeletingId(b.id)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      aria-label="Delete recipient"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : b.id)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="pt-2 border-t border-border space-y-1">
                    <p className="text-xs text-muted-foreground break-all">
                      <span className="font-medium text-foreground">
                        Address:{" "}
                      </span>
                      {b.address}
                    </p>
                    {b.memo && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Memo:{" "}
                        </span>
                        {b.memo}
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
