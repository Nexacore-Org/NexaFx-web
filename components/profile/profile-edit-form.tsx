"use client";

import { Loader2, Mail, Phone, Save, User as UserIcon } from "lucide-react";
import { getProfile, updateProfile } from "@/lib/api/users";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/hooks/use-auth-store";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/profile";
import { Input } from "@/components/ui/Input";

export function ProfileEditForm() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    getProfile().then((profile) => {
      setEmail(profile.email);
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone || "",
      });
    });
  }, [reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    setApiError("");
    setSuccessMessage("");
    try {
      const updated = await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
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
        localStorage.getItem("refresh_token") || ""
      );
      setSuccessMessage("Profile updated successfully");
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm">
      <div className="mb-8 border-b border-border pb-4">
        <h3 className="text-xl font-bold text-foreground">Personal Information</h3>
        <p className="text-sm text-muted-foreground mt-1">Update your personal details here.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium text-foreground">
              First Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground/50" />
              <Input
                id="firstName"
                {...register("firstName")}
                type="text"
                placeholder="First Name"
                error={errors.firstName?.message}
                className="pl-10 h-11 rounded-lg border border-input bg-background focus-visible:ring-primary/50 focus-visible:border-primary"
              />
            </div>
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium text-foreground">
              Last Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground/50" />
              <Input
                id="lastName"
                {...register("lastName")}
                type="text"
                placeholder="Last Name"
                error={errors.lastName?.message}
                className="pl-10 h-11 rounded-lg border border-input bg-background focus-visible:ring-primary/50 focus-visible:border-primary"
              />
            </div>
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground/50" />
              <input
                id="email"
                type="email"
                readOnly
                value={email}
                className="flex h-11 w-full rounded-lg border border-input bg-muted pl-10 pr-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-foreground">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground/50" />
              <Input
                id="phone"
                {...register("phone")}
                type="tel"
                placeholder="+1 (555) 000-0000"
                error={errors.phone?.message}
                className="pl-10 h-11 rounded-lg border border-input bg-background focus-visible:ring-primary/50 focus-visible:border-primary"
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {(successMessage || apiError) && (
          <div
            className={`p-4 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
              successMessage
                ? "bg-green-500/10 text-green-600 border border-green-500/20"
                : "bg-red-500/10 text-red-600 border border-red-500/20"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${successMessage ? "bg-green-600" : "bg-red-600"}`} />
            {successMessage || apiError}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 active:scale-[0.98] transition-transform"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
