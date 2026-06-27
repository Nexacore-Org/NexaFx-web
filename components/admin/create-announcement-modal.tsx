"use client";

import { useState } from "react";

const colorThemes = [
  { value: "yellow", label: "Yellow" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "red", label: "Red" },
  { value: "purple", label: "Purple" },
];

const targetPages = [
  { value: "all", label: "All Pages" },
  { value: "dashboard", label: "Dashboard" },
  { value: "convert", label: "Convert" },
  { value: "transactions", label: "Transactions" },
  { value: "help", label: "Help Center" },
];

type Props = {
  onClose: () => void;
  onCreate: (data: {
    title: string;
    message: string;
    colorTheme: string;
    targetPage: string;
  }) => void;
};

export default function CreateAnnouncementModal({ onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [colorTheme, setColorTheme] = useState("yellow");
  const [targetPage, setTargetPage] = useState("all");

  const handleCreate = () => {
    if (!title || !message) return;
    onCreate({ title, message, colorTheme, targetPage });
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
        <h2 className="text-center font-bold text-lg mb-2">
          CREATE ANNOUNCEMENT
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Create a new announcement banner
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title:</label>
            <input
              type="text"
              placeholder="Announcement title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-md px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Message:</label>
            <textarea
              placeholder="Announcement message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border rounded-md px-3 py-2 mt-1"
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Color Theme:</label>
            <select
              value={colorTheme}
              onChange={(e) => setColorTheme(e.target.value)}
              className="w-full border rounded-md px-3 py-2 mt-1"
            >
              {colorThemes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Target Page:</label>
            <select
              value={targetPage}
              onChange={(e) => setTargetPage(e.target.value)}
              className="w-full border rounded-md px-3 py-2 mt-1"
            >
              {targetPages.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleCreate}
              className="flex-1 bg-[#FFD552] text-black py-2 rounded-md font-medium"
            >
              Create
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
