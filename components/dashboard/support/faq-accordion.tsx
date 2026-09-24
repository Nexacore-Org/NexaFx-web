"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  category: string;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    category: "Account",
    items: [
      { q: "How do I create an account?", a: "Click the Sign Up button on the top right corner, fill in your email, create a password, and follow the verification steps." },
      { q: "How do I verify my account?", a: "Go to Settings > Verification and upload the required identification documents. Verification typically takes 24-48 hours." },
      { q: "I forgot my password", a: "Click 'Forgot Password' on the login page and follow the instructions sent to your registered email." },
    ],
  },
  {
    category: "Deposits",
    items: [
      { q: "What deposit methods are available?", a: "We support bank transfers, credit/debit cards, and various cryptocurrencies depending on your region." },
      { q: "How long do deposits take?", a: "Crypto deposits typically arrive within 10-30 minutes. Bank transfers may take 1-3 business days." },
      { q: "Are there deposit fees?", a: "We do not charge deposit fees, but your payment provider or bank may apply their own fees." },
    ],
  },
  {
    category: "Withdrawals",
    items: [
      { q: "How do I make a withdrawal?", a: "Navigate to your dashboard, click Withdraw, select your currency and amount, then confirm the transaction." },
      { q: "What are the withdrawal limits?", a: "Minimum withdrawal varies by currency. Daily limits apply based on your verification level." },
      { q: "Why is my withdrawal pending?", a: "Withdrawals are reviewed for security. Most are processed within 24 hours." },
    ],
  },
  {
    category: "Conversions",
    items: [
      { q: "How do currency conversions work?", a: "Use the Convert tool on your dashboard. Enter the amount and select your target currency to see the exchange rate." },
      { q: "What exchange rate do you use?", a: "We use real-time market rates with a small spread. The rate is shown before you confirm." },
      { q: "Can I cancel a conversion?", a: "Conversions are instant and cannot be reversed once confirmed." },
    ],
  },
  {
    category: "Security",
    items: [
      { q: "How do I enable two-factor authentication?", a: "Go to Settings > Security and enable 2FA. Scan the QR code with your authenticator app." },
      { q: "Is my data safe?", a: "Yes, we use industry-standard encryption and security practices to protect your data and funds." },
    ],
  },
];

export function FAQAccordion() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">Frequently Asked Questions</h2>
      {faqData.map((cat) => (
        <div key={cat.category} className="border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setOpenCategory(openCategory === cat.category ? null : cat.category)}
            className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors"
          >
            <span className="font-semibold text-sm">{cat.category}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                openCategory === cat.category && "rotate-180",
              )}
            />
          </button>
          {openCategory === cat.category && (
            <div className="divide-y divide-border">
              {cat.items.map((item, idx) => {
                const key = `${cat.category}-${idx}`;
                return (
                  <div key={key}>
                    <button
                      onClick={() => toggleItem(key)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                    >
                      <span className="text-sm font-medium">{item.q}</span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                          openItems[key] && "rotate-180",
                        )}
                      />
                    </button>
                    {openItems[key] && (
                      <div className="px-4 pb-3">
                        <p className="text-sm text-muted-foreground">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
