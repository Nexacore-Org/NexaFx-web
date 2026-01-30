import { Notification } from "@/types/notification";

const now = new Date();

function minutesAgo(minutes: number): Date {
  return new Date(now.getTime() - minutes * 60 * 1000);
}

function hoursAgo(hours: number): Date {
  return new Date(now.getTime() - hours * 60 * 60 * 1000);
}

export const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "kyc",
    title: "KYC Submitted",
    message: "Your KYC documents have been **submitted for review**.",
    timestamp: minutesAgo(3),
    isRead: false,
  },
  {
    id: "2",
    type: "deposit",
    title: "Deposit Received",
    message: "Deposit of **₦50,000** received successfully.",
    timestamp: hoursAgo(1),
    isRead: false,
  },
  {
    id: "3",
    type: "swap",
    title: "Swap Successful",
    message: "Swap from **BNB** to **ETH** was successful.",
    timestamp: hoursAgo(5),
    isRead: false,
  },
  {
    id: "4",
    type: "swap",
    title: "Swap Successful",
    message: "Swap from **BNB** to **ETH** was successful.",
    timestamp: hoursAgo(5),
    isRead: true,
  },
  {
    id: "5",
    type: "swap",
    title: "Swap Successful",
    message: "Swap from **BNB** to **ETH** was successful.",
    timestamp: hoursAgo(5),
    isRead: true,
  },
  {
    id: "6",
    type: "swap",
    title: "Swap Successful",
    message: "Swap from **BNB** to **ETH** was successful.",
    timestamp: hoursAgo(5),
    isRead: true,
  },
  {
    id: "7",
    type: "swap",
    title: "Swap Successful",
    message: "Swap from **BNB** to **ETH** was successful.",
    timestamp: hoursAgo(5),
    isRead: true,
  },
  {
    id: "8",
    type: "swap",
    title: "Swap Successful",
    message: "Swap from **BNB** to **ETH** was successful.",
    timestamp: hoursAgo(5),
    isRead: true,
  },
  {
    id: "9",
    type: "deposit",
    title: "Deposit Received",
    message: "Deposit of **₦100,000** received successfully.",
    timestamp: hoursAgo(5),
    isRead: true,
  },
  {
    id: "10",
    type: "swap",
    title: "Swap Successful",
    message: "Swap from **BNB** to **ETH** was successful.",
    timestamp: hoursAgo(5),
    isRead: true,
  },
];
