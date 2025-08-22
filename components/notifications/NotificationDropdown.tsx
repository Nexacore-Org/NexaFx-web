import {
  useMarkAllAsRead,
  useNotifications,
} from "@/hooks/notification/useNotifications";
import {
  ArrowLeft,
  CalendarDays,
  CircleUserRound,
  Download,
  RefreshCw,
  Settings,
} from "lucide-react";
import { useState } from "react";

interface NotificationDropdownProps {
  setIsOpen: (isOpen: boolean) => void;
}

const notifications = [
  {
    id: 1,
    icon: <CircleUserRound className="text-gray-600" />,
    message: "Your KYC documents have been submitted for review.",
    createdAt: "3 mins ago",
    type: "info",
  },
  {
    id: 2,
    icon: <Download className="text-[#009411]" />,
    message: "Deposit of ₦50,000 received successfully.",
    createdAt: "1 hr ago",
    type: "success",
  },
  {
    id: 3,
    icon: <RefreshCw className="text-[#E58600]" />,
    message: "Swap from BNB to ETH was successful.",
    createdAt: "5 hr ago",
    type: "swap",
  },
];

export default function NotificationDropdown({
  setIsOpen,
}: NotificationDropdownProps) {
  // For now, I will use the dummy data for notifications because the userId is not available yet. But eventually, the userId will be passed into this custom hook and the data will be looped over.
  const { data } = useNotifications("123e4567-e89b-12d3-a456-426614174000");

  const { mutate: markAllAsRead, isPending } = useMarkAllAsRead();
  const [checked, setChecked] = useState(false);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setChecked(isChecked);

    if (isChecked) {
      // This userId should be replaced with the real one
      markAllAsRead("123e4567-e89b-12d3-a456-426614174000");
    }
  };

  console.log(data);

  return (
    <div className="max-sm:fixed max-sm:inset-0 max-sm:h-screen md:absolute right-0 top-12 w-[400px] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ArrowLeft
            className="cursor-pointer md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={handleCheckboxChange}
              disabled={isPending}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span>Mark all as read</span>
          </label>
          <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      <div className="md:max-h-64 overflow-y-auto p-4 space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-start space-x-3 p-4 hover:bg-gray-50 transition-colors border border-gray-200 rounded-xl"
          >
            <div className="flex-shrink-0 mt-0.5">{notification?.icon}</div>

            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-sm leading-relaxed">
                {notification.message}
              </p>

              <div className="flex items-center mt-2 text-xs text-teal-600">
                <CalendarDays className="w-3 h-3 mr-1" />
                {notification.createdAt}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Change this later to the data coming from the useNotifications hook */}
      {notifications.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          No new notifications
        </div>
      )}
    </div>
  );
}
