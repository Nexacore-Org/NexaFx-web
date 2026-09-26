"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FaqItem[] = [
  {
    question: "How do I deposit funds into my account?",
    answer:
      "Navigate to your Dashboard and click the Deposit button. Select your preferred payment method, enter the amount, and follow the on-screen instructions. Funds typically arrive within minutes.",
    category: "Account",
  },
  {
    question: "How long do withdrawals take?",
    answer:
      "Withdrawals are processed within 24 hours on business days. Processing may take longer on weekends or public holidays. You can track your withdrawal status in the Transactions page.",
    category: "Transactions",
  },
  {
    question: "Is my personal information secure?",
    answer:
      "Yes. We use industry-standard encryption and security protocols to protect your data. All communications are encrypted via TLS, and we never share your information with third parties without your consent.",
    category: "Security",
  },
  {
    question: "How do I verify my account?",
    answer:
      "Go to Settings and select Verification. You will need to upload a valid government-issued ID and proof of address. Verification usually takes 1-2 business days.",
    category: "Verification",
  },
  {
    question: "What currencies are supported?",
    answer:
      "We support USD, NGN, EUR, GBP, and several other major currencies. Check the Convert page for the full list of available currency pairs and current exchange rates.",
    category: "Account",
  },
  {
    question: "Can I cancel a transaction?",
    answer:
      "Pending transactions can be cancelled from the Transactions page. Once a transaction has been processed, it cannot be reversed. Contact support if you need assistance.",
    category: "Transactions",
  },
  {
    question: "Why was my transaction declined?",
    answer:
      "Transactions may be declined due to insufficient funds, security flags, or verification requirements. Check your balance and verification status, or contact support for more details.",
    category: "Transactions",
  },
  {
    question: "How do I enable two-factor authentication?",
    answer:
      "Go to Settings > Security and enable 2FA. You can use an authenticator app like Google Authenticator or Authy. Scan the QR code and enter the verification code to complete setup.",
    category: "Security",
  },
  {
    question: "What documents are needed for verification?",
    answer:
      "You need a valid government-issued ID (passport, driver's license, or national ID) and a recent proof of address (utility bill or bank statement dated within the last 3 months).",
    category: "Verification",
  },
  {
    question: "How do I change my password?",
    answer:
      "Go to Settings > Security and click Change Password. Enter your current password and your new password. Make sure your new password is at least 8 characters with a mix of letters, numbers, and symbols.",
    category: "Security",
  },
];

const categories = ["All", "Account", "Transactions", "Security", "Verification"];

function FaqSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border border-border rounded-xl p-4 space-y-3">
          <div className="h-5 w-3/4 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

export function HelpFaq() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loading] = useState(false);

  const filtered = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <FaqSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search FAQs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No FAQs match your search. Try a different keyword.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 ml-2 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
