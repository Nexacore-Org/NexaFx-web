import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/services/api/config";
import axiosClient from "@/services/api/axiosClient";

// Types for push announcement
export interface PushAnnouncementData {
  title: string;
  message: string;
  priority?: "low" | "medium" | "high";
  scheduledAt?: string; // ISO date string for scheduling
}

export interface PushAnnouncementResponse {
  success: boolean;
  message: string;
  announcementId?: string;
}

// API function to push announcement
const pushAnnouncement = async (data: PushAnnouncementData): Promise<PushAnnouncementResponse> => {
  const response = await axiosClient.post(API_ENDPOINTS.ADMIN.ANNOUNCEMENTS, data);
  return response.data;
};

// Hook to push announcement
export const usePushAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation<PushAnnouncementResponse, Error, PushAnnouncementData>({
    mutationFn: pushAnnouncement,
    onSuccess: (data) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      console.error("Failed to push announcement:", error);
    },
  });
};
