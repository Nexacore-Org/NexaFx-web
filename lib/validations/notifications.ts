import { z } from "zod";

export const pushNotificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
});

export type PushNotificationFormValues = z.infer<typeof pushNotificationSchema>;
