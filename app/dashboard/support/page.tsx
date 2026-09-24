"use client";

import { HeadphonesIcon, Mail, MessageCircle, ExternalLink } from "lucide-react";
import { FAQAccordion } from "@/components/dashboard/support/faq-accordion";
import { ContactForm } from "@/components/dashboard/support/contact-form";

const socialLinks = [
  { icon: Mail, label: "Email Support", href: "mailto:support@nexafx.com", desc: "support@nexafx.com" },
  { icon: MessageCircle, label: "Live Chat", href: "#", desc: "Available 24/7" },
  { icon: ExternalLink, label: "Help Center", href: "#", desc: "Knowledge base & guides" },
];

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <HeadphonesIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Help & Support</h1>
          <p className="text-sm text-muted-foreground">
            Find answers or get in touch with our team
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {socialLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center gap-3 border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{link.label}</p>
                <p className="text-xs text-muted-foreground">{link.desc}</p>
              </div>
            </a>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FAQAccordion />
        <ContactForm />
      </div>
    </div>
  );
}
