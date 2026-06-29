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
