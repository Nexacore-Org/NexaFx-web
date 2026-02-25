const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

function getAuthHeaders (): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function deleteProfile (): Promise<void> {
  const res = await fetch(`${API_BASE}/users/profile`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Failed to delete account");
  }
}

// --- Added for profile integration ---
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  phone?: string;
}

export async function getProfile (): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/users/profile`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Failed to fetch profile");
  }
  return res.json();
}

export async function updateProfile (data: UpdateProfileDto): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/users/profile`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Failed to update profile");
  }
  return res.json();
}
