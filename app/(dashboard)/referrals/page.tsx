"use client";

import { useState } from "react";
import { Copy, Check, Share2, Gift, UserPlus, DollarSign, Star } from "lucide-react";
import { ReferralStats } from "@/components/dashboard/referral-stats";
import { ReferralTable } from "@/components/dashboard/referral-table";

const REFERRAL_LINK = "https://nexafx.com/ref/abc123";

const shareLinks = [
  {
    name: "Twitter",
    href: `https://twitter.com/intent/tweet?text=${encodeURIComponent("Join NexaFx and start trading! Use my referral link:")}&url=${encodeURIComponent(REFERRAL_LINK)}`,
    color: "bg-[#1DA1F2] hover:bg-[#1a8cd8]",
  },
  {
    name: "WhatsApp",
    href: `https://wa.me/?text=${encodeURIComponent(`Join NexaFx and start trading! Use my referral link: ${REFERRAL_LINK}`)}`,
    color: "bg-[#25D366] hover:bg-[#20bd5a]",
  },
  {
    name: "Telegram",
    href: `https://t.me/share/url?url=${encodeURIComponent(REFERRAL_LINK)}&text=${encodeURIComponent("Join NexaFx and start trading!")}`,
    color: "bg-[#0088cc] hover:bg-[#0077b5]",
  },
];

const steps = [
  {
    icon: UserPlus,
    title: "Share Your Link",
    description: "Share your unique referral link with friends and family.",
  },
  {
    icon: Gift,
    title: "They Sign Up",
    description: "Your referrals create an account and start trading.",
  },
  {
    icon: DollarSign,
    title: "You Earn Rewards",
    description: "Earn $50 for every active referral that completes a trade.",
  },
  {
    icon: Star,
    title: "Unlock Bonuses",
    description: "Unlock higher rewards as you refer more users.",
  },
];

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(REFERRAL_LINK);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Referrals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Invite friends and earn rewards for every active referral.
        </p>
      </div>

      <ReferralStats
        totalReferrals={5}
        activeReferrals={4}
        totalEarned={200}
      />

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Your Referral Link
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-muted rounded-md px-4 py-3 text-sm text-foreground font-mono truncate">
            {REFERRAL_LINK}
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-3 bg-[#F0BB16] hover:bg-yellow-500 rounded-md text-black font-medium transition-colors text-sm shrink-0"
          >
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Share2 className="size-4" /> Share on:
          </span>
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${link.color}`}
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Referral Rewards
        </h2>
        <ReferralTable />
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <h2 className="text-lg font-semibold text-foreground">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  <div className="h-14 w-14 rounded-full bg-[#F0BB16]/10 flex items-center justify-center">
                    <Icon className="size-7 text-[#F0BB16]" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
