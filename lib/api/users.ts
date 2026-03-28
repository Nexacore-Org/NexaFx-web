import { apiClient } from "../api-client";

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

export async function deleteProfile (): Promise<void> {
  return apiClient("/users/profile", {
    method: "DELETE",
    useProxy: false,
  });
}

export async function getProfile (): Promise<UserProfile> {
  return apiClient("/users/profile", {
    method: "GET",
    useProxy: false,
  });
}

export async function updateProfile (data: UpdateProfileDto): Promise<UserProfile> {
  return apiClient("/users/profile", {
    method: "PATCH",
    useProxy: false,
    body: JSON.stringify(data),
  });
}
