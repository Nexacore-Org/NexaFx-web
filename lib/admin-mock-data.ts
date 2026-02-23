export type PushNotification = {
    id: string;
    title: string;
    message: string;
    status: "Active" | "Inactive";
    createdAt: string;
};

export const mockPushNotifications: PushNotification[] = [
    {
        id: "1",
        title: "Topics",
        message:
            "Lorem ipsum dolor sit amet consectetur. Nullam sapien varius nec enim dignissim  v um dolor sit amet consectetur. Nullam sapien varius nec enim dignissim nibh dignissim blandit. Aliquam ac faucibus montes a tempor. Est consequat metus vitae tellus commodo. Cursus nunc accumsan in arcu.",
        status: "Active",
        createdAt: "Jul 6, 2025",
    },
    {
        id: "2",
        title: "Header",
        message: "Lorem ipsum dolor sit amet...",
        status: "Inactive",
        createdAt: "Aug 6, 2005",
    },
    {
        id: "3",
        title: "Sub-Header",
        message: "Lorem ipsum dolor sit amet...",
        status: "Inactive",
        createdAt: "Aug 6, 2005",
    },
    {
        id: "4",
        title: "Topics",
        message: "Lorem ipsum dolor sit amet...",
        status: "Inactive",
        createdAt: "Aug 6, 2005",
    },
    {
        id: "5",
        title: "Topics",
        message: "Lorem ipsum dolor sit amet...",
        status: "Inactive",
        createdAt: "Aug 6, 2005",
    },
    {
        id: "6",
        title: "Topics",
        message: "Lorem ipsum dolor sit amet...",
        status: "Inactive",
        createdAt: "Aug 6, 2005",
    },
    {
        id: "7",
        title: "Topics",
        message: "Lorem ipsum dolor sit amet...",
        status: "Inactive",
        createdAt: "Aug 6, 2005",
    },
    {
        id: "8",
        title: "Topics",
        message: "Lorem ipsum dolor sit amet...",
        status: "Inactive",
        createdAt: "Aug 6, 2005",
    },
] as const;
export interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  walletAddress: string;
  username: string;
  avatarUrl: string | null;
  transactions: number;
  totalDeposit: number;
  totalWithdraw: number;
  kycStatus: 'Verified' | 'Unverified';
  createdAt: string;
  isActive: boolean;
}

export const mockAdminUsers: AdminUser[] = [
  {
    id: '1',
    email: 'cerseiloaded@hotmail.com',
    firstName: 'First name',
    lastName: 'Last name',
    phone: '+65 9012474475',
    walletAddress: '0xAbc...123',
    username: 'cersei',
    avatarUrl: null,
    transactions: 32,
    totalDeposit: 315.00,
    totalWithdraw: 9.20,
    kycStatus: 'Unverified',
    createdAt: 'Jul 4, 2025',
    isActive: true,
  },
  {
    id: '2',
    email: 'cerseihotmail@gmail.com',
    firstName: null,
    lastName: null,
    phone: null,
    walletAddress: '0xDef...456',
    username: 'user2',
    avatarUrl: null,
    transactions: 15,
    totalDeposit: 500.00,
    totalWithdraw: 50.00,
    kycStatus: 'Verified',
    createdAt: 'Jun 14, 2025',
    isActive: true,
  },
  {
    id: '3',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 555-0123',
    walletAddress: '0xGhi...789',
    username: 'johndoe',
    avatarUrl: null,
    transactions: 48,
    totalDeposit: 1200.00,
    totalWithdraw: 300.00,
    kycStatus: 'Verified',
    createdAt: 'Jun 14, 2025',
    isActive: true,
  },
];

// Generate more mock users to reach 100 entries
for (let i = 4; i <= 100; i++) {
  mockAdminUsers.push({
    id: `${i}`,
    email: `user${i}@example.com`,
    firstName: i % 3 === 0 ? null : `User${i}`,
    lastName: i % 3 === 0 ? null : `Last${i}`,
    phone: i % 4 === 0 ? null : `+1 555-${String(i).padStart(4, '0')}`,
    walletAddress: `0x${Math.random().toString(16).substr(2, 6)}...${Math.random().toString(16).substr(2, 3)}`,
    username: `user${i}`,
    avatarUrl: null,
    transactions: Math.floor(Math.random() * 100),
    totalDeposit: Math.floor(Math.random() * 10000) / 10,
    totalWithdraw: Math.floor(Math.random() * 1000) / 10,
    kycStatus: i % 2 === 0 ? 'Verified' : 'Unverified',
    createdAt: 'Jun 14, 2025',
    isActive: true,
  });
}

export const mockAdminUserDetails = {
  id: '1',
  firstName: 'First name',
  lastName: 'Last name',
  email: 'cerseiloaded@hotmail.com',
  phone: '+65 9012474475',
  walletAddress: '0xAbc...123',
  username: 'cersei',
  avatarUrl: null,
  transactions: 32,
  totalDeposit: 315.00,
  totalWithdraw: 9.20,
  kycStatus: 'Unverified',
  createdAt: 'Jul 4, 2025',
};
