"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pushNotificationSchema, type PushNotificationFormValues } from "@/lib/validations/notifications";
import { Input } from "@/components/ui/Input";

type Props = {
  onClose: () => void;
  onCreate: (title: string, message: string) => void;
};

export default function CreatePushNotificationModal({ onClose, onCreate }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PushNotificationFormValues>({
    resolver: zodResolver(pushNotificationSchema),
  });

  const onSubmit = (data: PushNotificationFormValues) => {
    onCreate(data.title, data.message);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-md:w-screen max-md:h-[100dvh] max-md:max-h-screen max-md:rounded-none max-md:overflow-y-auto w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-center font-bold text-lg mb-2">PUSH NOTIFICATION LISTING</h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Enter Push Notification to be sent to all users
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title:</label>
            <Input
              {...register("title")}
              type="text"
              placeholder="Notification title"
              error={errors.title?.message}
              className="mt-1 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Message:</label>
            <div>
              <textarea
                {...register("message")}
                placeholder="What do you want to say"
                rows={4}
                className={`w-full border rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD552] transition-all ${
                  errors.message ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="flex-1 bg-[#FFD552] text-black py-2 rounded-md font-medium"
            >
              Send
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
