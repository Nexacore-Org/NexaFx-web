import React from "react";
import { Download, X } from "lucide-react";

export interface NotificationProps {
  message: string;
  amount?: string;
  onViewTransaction?: () => void;
  onClose?: () => void;
}

/* Desktop Notification */
export const DepositNotification: React.FC<NotificationProps> = ({
  message,
  amount,
  onViewTransaction,
  onClose,
}) => {
  return (
    <div className="bg-[#EDFFE6] border border-[#00941166] rounded-lg p-3 flex items-start gap-3 mb-4 animate-slideDown">
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
        <Download className="w-5 h-5 text-green-600" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm mb-1">
          Deposit Confirmation
        </h4>
        <p className="text-sm text-gray-700">
          {message} <span className="font-semibold">{amount}</span>{" "}
          {message.includes("received") ? "received successfully." : ""}
        </p>
      </div>

      {onViewTransaction && (
        <button
          onClick={onViewTransaction}
          className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-xs font-semibold rounded transition-colors whitespace-nowrap"
        >
          View Transaction
        </button>
      )}

      {/* {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )} */}
    </div>
  );
};

/* Mobile Banner Notification */
export const MobileNotificationBanner: React.FC<NotificationProps> = ({
  message,
  amount,
  onClose,
}) => {
  return (
    <div className="bg-white space-x-2 absolute top-1 left-1 right-1  w-full rounded-sm border-b border-gray-200 p-3 flex items-center gap-3 animate-slideDown">
      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Download className="w-4 h-4 text-green-600" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-xs">
          Deposit Confirmation
        </h4>
        <p className="text-xs text-gray-600 truncate">
          {message} <span className="font-semibold">{amount}</span> received
          successfully.
        </p>
      </div>
      {/* 
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )} */}
    </div>
  );
};
