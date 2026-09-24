"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const subjects = [
  "Account Issue",
  "Transaction Problem",
  "KYC",
  "Technical Bug",
  "Other",
];

export function ContactForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const isValid = subject && message.trim().length >= 20;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSending(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3">
        <CheckCircle2 className="h-10 w-10 text-green-500" />
        <h3 className="text-lg font-semibold">Message Sent!</h3>
        <p className="text-sm text-muted-foreground">
          We&apos;ll get back to you within 24 hours.
        </p>
        <button
          onClick={() => {
            setSent(false);
            setSubject("");
            setMessage("");
          }}
          className="text-sm font-medium text-primary hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl p-6 space-y-4">
      <h2 className="text-xl font-bold text-foreground">Contact Us</h2>
      <p className="text-sm text-muted-foreground">
        Have a question or issue? Fill out the form below and our support team
        will reach out.
      </p>

      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">
          Subject
        </label>
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                subject === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">
          Message <span className="text-muted-foreground">(min 20 characters)</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="Describe your issue in detail..."
        />
        {message.length > 0 && message.length < 20 && (
          <p className="text-xs text-amber-600 mt-1">
            {20 - message.length} more characters needed
          </p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isValid || sending}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
          isValid && !sending
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-muted text-muted-foreground cursor-not-allowed",
        )}
      >
        {sending ? (
          <>Sending...</>
        ) : (
          <>
            <Send className="h-4 w-4" /> Send Message
          </>
        )}
      </button>
    </div>
  );
}
