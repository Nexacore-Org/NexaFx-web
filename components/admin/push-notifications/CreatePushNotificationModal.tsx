"use client";

import { useState } from "react";

type Props = {
    onClose: () => void;
    onCreate: (title: string, message: string) => void;
};

export default function CreatePushNotificationModal({
    onClose,
    onCreate,
}: Props) {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");

    const handleSend = () => {
        if (!title || !message) return;
        onCreate(title, message);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-center font-bold text-lg mb-2">
                    PUSH NOTIFICATION LISTING
                </h2>
                <p className="text-center text-sm text-gray-500 mb-6">
                    Enter Push Notification to be sent to all users
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Title:</label>
                        <input
                            type="text"
                            placeholder="Username"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 mt-1"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Message:</label>
                        <textarea
                            placeholder="What do you want to say"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 mt-1"
                            rows={4}
                        />
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={handleSend}
                            className="flex-1 bg-[#FFD552] text-black py-2 rounded-md font-medium"
                        >
                            Send
                        </button>

                        <button
                            onClick={onClose}
                            className="flex-1 border border-gray-300 py-2 rounded-md"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
