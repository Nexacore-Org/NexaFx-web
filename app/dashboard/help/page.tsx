"use client";

import { useState } from "react";
import { HelpFaq } from "@/components/dashboard/help-faq";
import { HelpContactForm } from "@/components/dashboard/help-contact-form";
import { LifeBuoy, MessageCircleQuestion, Loader2 } from "lucide-react";

export default function HelpPage() {
  const [tab, setTab] = useState<"faq" | "contact">("faq");
  const [loading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Help Center
        </h1>
        <p className="text-sm text-muted-foreground">
          Find answers to common questions or get in touch with our support team.
        </p>
      </div>

      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("faq")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === "faq"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageCircleQuestion className="w-4 h-4" />
          FAQ
        </button>
        <button
          onClick={() => setTab("contact")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === "contact"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          Contact Us
        </button>
      </div>

      {tab === "faq" ? <HelpFaq /> : <HelpContactForm />}
    </div>
  );
}
