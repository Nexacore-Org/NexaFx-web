"use client";

import { useState, useEffect } from "react";
import { Mail, Send, Trash2, Clock, Users, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBroadcastEmails, sendBroadcastEmail, deleteBroadcastEmail, type BroadcastEmail } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

type Audience = "All Users" | "Verified" | "Unverified" | "Premium";

const AUDIENCE_OPTIONS: { value: Audience; label: string }[] = [
  { value: "All Users", label: "All Users" },
  { value: "Verified", label: "Verified Users" },
  { value: "Unverified", label: "Unverified Users" },
  { value: "Premium", label: "Premium Users" },
];

export default function BroadcastEmailPage() {
  const [emails, setEmails] = useState<BroadcastEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState<Audience>("All Users");
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchEmails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBroadcastEmails();
      setEmails(data);
    } catch {
      setError("Failed to load broadcast emails");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) return;
    setIsSending(true);
    setSuccessMsg(null);
    try {
      await sendBroadcastEmail({ subject, content, targetAudience: audience });
      setSubject("");
      setContent("");
      setAudience("All Users");
      setSuccessMsg("Broadcast email sent successfully!");
      fetchEmails();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch {
      setError("Failed to send broadcast email");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this broadcast email?")) return;
    try {
      await deleteBroadcastEmail(id);
      setEmails((prev) => prev.filter((e) => e.id !== id));
    } catch {
      setError("Failed to delete broadcast email");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Sent":
        return <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Sent</span>;
      case "Pending":
        return <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pending</span>;
      case "Failed":
        return <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Failed</span>;
      default:
        return <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Mail className="h-6 w-6" /> Broadcast Emails
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Send emails to all users or specific audience segments.</p>
      </div>

      {/* Compose */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Compose Broadcast</h2>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Subject</label>
          <Input
            placeholder="Enter email subject..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Content</label>
          <Textarea
            placeholder="Write your email content here... (HTML supported)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Target Audience</label>
          <div className="flex flex-wrap gap-2">
            {AUDIENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAudience(opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                  audience === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {successMsg && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{successMsg}</div>
        )}

        <Button onClick={handleSend} disabled={!subject.trim() || !content.trim() || isSending} className="gap-2">
          <Send className="h-4 w-4" />
          {isSending ? "Sending..." : "Send Broadcast"}
        </Button>
      </div>

      {/* History */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Email History</h2>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : emails.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No broadcast emails yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {emails.map((email) => (
              <div key={email.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">{email.subject}</p>
                      {getStatusBadge(email.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{email.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {email.targetAudience}
                      </span>
                      <span>{email.recipientCount.toLocaleString()} recipients</span>
                      {email.sentAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Sent {email.sentAt}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-red-600"
                    onClick={() => handleDelete(email.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
