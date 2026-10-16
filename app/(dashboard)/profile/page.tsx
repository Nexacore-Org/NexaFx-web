"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { ProfileForm } from "@/components/profile/profile-form";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { displayName } from "@/types/user";

export default function ProfilePage() {
  const { user, status } = useAuth();

  if (status === "loading") {
    return (
      <div className="space-y-6" role="status" aria-busy="true">
        <span className="sr-only">Loading profile…</span>
        <div className="flex items-center gap-4">
          <Skeleton width={64} height={64} />
          <div className="space-y-2">
            <Skeleton width={160} height={18} />
            <Skeleton width={220} height={14} />
          </div>
        </div>
        <Skeleton width="100%" height={200} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center">
        <h1 className="text-lg font-semibold text-gray-900">
          You&apos;re not signed in
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Please sign in to view and edit your profile.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const name = displayName(user);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-lg font-semibold text-gray-900">Profile</h1>

      <div className="mb-8 flex items-center gap-4">
        <Avatar name={name} size="lg" />
        <div>
          <p className="text-base font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      <ProfileForm user={user} />
    </div>
  );
}
