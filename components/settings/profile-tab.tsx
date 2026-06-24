"use client";

import { Loader2, Mail, Phone, Save, User as UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getProfile, updateProfile, type UpdateProfileDto, type UserProfile } from "@/lib/api/users";
import { useAuthStore } from "@/hooks/use-auth-store";
import { toast } from "@/hooks/use-toast-store";

export function ProfileTab() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const originalProfile = useRef<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    let cancelled = false;
    setIsFetching(true);
    getProfile()
      .then((profile) => {
        if (cancelled) return;
        originalProfile.current = profile;
        setFormData({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone || "",
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load profile",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsFetching(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCancel = () => {
    const original = originalProfile.current;
    if (!original) return;
    setFormData({
      firstName: original.firstName,
      lastName: original.lastName,
      email: original.email,
      phone: original.phone || "",
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const original = originalProfile.current;
    if (!original) return;

    setIsLoading(true);
    setError(null);

    try {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        throw new Error("First and last name are required");
      }

      const changes: UpdateProfileDto = {};
      if (formData.firstName !== original.firstName) {
        changes.firstName = formData.firstName;
      }
      if (formData.lastName !== original.lastName) {
        changes.lastName = formData.lastName;
      }
      if (formData.phone !== (original.phone || "")) {
        changes.phone = formData.phone;
      }

      if (Object.keys(changes).length === 0) {
        toast("No changes to save", "info");
        return;
      }

      const updated = await updateProfile(changes);
      originalProfile.current = updated;
      setAuth(
        {
          id: updated.id,
          firstName: updated.firstName,
          lastName: updated.lastName,
          name: `${updated.firstName} ${updated.lastName}`,
          email: updated.email,
          role: "USER",
        },
        localStorage.getItem("access_token") || "",
        localStorage.getItem("refresh_token") || "",
      );
      toast("Profile updated successfully", "success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="size-6 animate-spin mr-2" aria-hidden="true" />
        <span>Loading profile…</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="mb-8 border-b border-border pb-4">
        <h2 className="text-xl font-bold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">
          View and update your personal information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="settings-firstName" className="text-sm font-medium text-foreground">
              First Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground/50" aria-hidden="true" />
              <input
                id="settings-firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="settings-lastName" className="text-sm font-medium text-foreground">
              Last Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground/50" aria-hidden="true" />
              <input
                id="settings-lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="settings-email" className="text-sm font-medium text-foreground">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground/50" aria-hidden="true" />
              <input
                id="settings-email"
                type="email"
                readOnly
                aria-readonly="true"
                value={formData.email}
                className="flex h-11 w-full rounded-lg border border-input bg-muted pl-10 pr-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="settings-phone" className="text-sm font-medium text-foreground">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground/50" aria-hidden="true" />
              <input
                id="settings-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-3 md:flex-row flex-col md:max-w-105.25 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 cursor-pointer py-4 bg-[#F0BB16] hover:bg-yellow-500 rounded-sm text-black font-medium transition-colors md:text-sm disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving…
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                <Save className="size-4" aria-hidden="true" />
                Save Changes
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 cursor-pointer py-4 border border-border hover:bg-muted text-foreground font-semibold rounded-sm transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
