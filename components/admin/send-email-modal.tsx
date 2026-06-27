"use client";

import { useState } from "react";
import { X, Loader2, Send, Eye, EyeOff } from "lucide-react";
import { sendAdminEmail, type AdminUser } from "@/lib/api/admin";

interface SendEmailModalProps {
  user: AdminUser;
  onClose: () => void;
  onSuccess: () => void;
}

const EMAIL_TEMPLATES: Record<string, { subject: string; message: string }> = {
  welcome: {
    subject: "Welcome to NexaFX!",
    message:
      "Dear {{name}},\n\nWelcome to NexaFX! We're excited to have you on board.\n\nYour account has been successfully created and you can now start trading.\n\nBest regards,\nThe NexaFX Team",
  },
  verification: {
    subject: "Account Verification Update",
    message:
      "Dear {{name}},\n\nYour account verification status has been updated.\n\nPlease log in to your account to view the changes.\n\nBest regards,\nThe NexaFX Team",
  },
  notification: {
    subject: "Important Account Notification",
    message:
      "Dear {{name}},\n\nThis is an important notification regarding your NexaFX account.\n\nPlease review the details in your account dashboard.\n\nBest regards,\nThe NexaFX Team",
  },
  custom: {
    subject: "",
    message: "",
  },
};

function renderTemplate(template: string, name: string): string {
  return template.replace(/\{\{name\}\}/g, name);
}

export function SendEmailModal({ user, onClose, onSuccess }: SendEmailModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email;

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (template !== "custom") {
      const tpl = EMAIL_TEMPLATES[template];
      setSubject(tpl.subject);
      setMessage(tpl.message);
    }
    setError(null);
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      setError("Subject and message are required.");
      return;
    }
    try {
      setSending(true);
      setError(null);
      await sendAdminEmail({
        userId: user.id,
        email: user.email,
        subject,
        message,
        template: selectedTemplate as SendEmailModalProps["user"]["kycStatus"] extends string
          ? "welcome" | "verification" | "notification" | "custom"
          : "custom",
      });
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send email.";
      setError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const previewMessage = renderTemplate(message, userName);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 lg:inset-x-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 max-h-[90vh] w-full lg:w-[640px] bg-white shadow-2xl z-50 overflow-y-auto rounded-t-3xl lg:rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white px-5 py-4 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Send Email</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {user.email}
            </div>
          </div>

          {/* Template Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="custom">Custom</option>
              <option value="welcome">Welcome</option>
              <option value="verification">Verification</option>
              <option value="notification">Notification</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setError(null);
              }}
              placeholder="Email subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setError(null);
              }}
              placeholder="Write your message here... Use {{name}} for the user's name."
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-y"
            />
          </div>

          {/* Toggle Preview */}
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {showPreview ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>

          {/* Preview Pane */}
          {showPreview && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Preview
              </h4>
              <p className="text-xs text-gray-400 mb-1">
                <strong>Subject:</strong> {subject || "(no subject)"}
              </p>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                {previewMessage || "(no message)"}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !subject.trim() || !message.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
