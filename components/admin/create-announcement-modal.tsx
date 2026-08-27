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
  { value: "settings", label: "Settings" },
];

interface Props {
  onSubmit: (data: {
    title: string;
    message: string;
    colorTheme: string;
    targetPage: string;
  }) => Promise<void>;
  onClose: () => void;
}

export function CreateAnnouncementModal({ onSubmit, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [colorTheme, setColorTheme] = useState("yellow");
  const [targetPage, setTargetPage] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        message: message.trim(),
        colorTheme,
        targetPage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-md border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">New Announcement</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Announcement title"
              className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Write your announcement..."
              className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              required
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {message.length}/500
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Color Theme
              </label>
              <select
                value={colorTheme}
                onChange={(e) => setColorTheme(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 capitalize"
              >
                {colorThemes.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Target Page
              </label>
              <select
                value={targetPage}
                onChange={(e) => setTargetPage(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 capitalize"
              >
                {targetPages.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!title.trim() || !message.trim() || submitting}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : "Create Announcement"}
          </button>
        </form>
      </div>
    </div>
  );
}
