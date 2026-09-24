"use client";

import { useState } from "react";
import { Paperclip, Send, Loader2 } from "lucide-react";

const subjects = [
  "Account Issue",
  "Transaction Problem",
  "Security Concern",
  "Verification Help",
  "General Inquiry",
  "Other",
];

export function HelpContactForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    setSubject("");
    setMessage("");
    setFile(null);
  };

  if (sent) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center space-y-3">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Send className="w-5 h-5 text-green-600" />
        </div>
        <p className="font-semibold text-foreground">Message Sent!</p>
        <p className="text-sm text-muted-foreground">
          We will get back to you within 24 hours.
        </p>
        <button
          onClick={() => setSent(false)}
          className="text-sm font-medium text-yellow-600 hover:text-yellow-700"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-4">
      <div>
        <label htmlFor="subject" className="text-sm font-medium mb-1.5 block">
          Subject
        </label>
        <select
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          required
        >
          <option value="">Select a subject</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="text-sm font-medium mb-1.5 block">
          Message
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Describe your issue in detail..."
          className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">
          Attachment (optional)
        </label>
        <label className="flex items-center gap-2 cursor-pointer bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Paperclip className="w-4 h-4" />
          <span>{file ? file.name : "Attach a file"}</span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={!subject || !message || sending}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
