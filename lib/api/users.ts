import { apiClient } from "@/lib/api-client";

export interface UserSession {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  location?: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export const getSessions = (): Promise<UserSession[]> => {
  return apiClient("/users/sessions");
};

export const terminateSession = (id: string): Promise<void> => {
  return apiClient(`/users/sessions/${id}`, {
    method: "DELETE",
  });
};

export const terminateAllOtherSessions = (): Promise<void> => {
  return apiClient("/users/sessions", {
    method: "DELETE",
  });
};
