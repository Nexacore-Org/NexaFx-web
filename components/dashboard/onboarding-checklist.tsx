"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";
import Link from "next/link";
import { getProfile, UserProfile } from "@/lib/api/users";
import { getTransactions } from "@/lib/api/transactions";

const STORAGE_PREFIX = "nexafx_onboarding_v1";

export default function OnboardingChecklist() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [hasDeposit, setHasDeposit] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const p = await getProfile();
        if (!mounted) return;
        setProfile(p);

        const key = `${STORAGE_PREFIX}_${p.id}`;
        const stored = typeof window !== "undefined" && window.localStorage.getItem(key);
        if (stored === "dismissed") setDismissed(true);

        const txs = await getTransactions({ limit: 50, type: "Deposit" });
        if (!mounted) return;
        const found = txs.data.some((t) => t.type === "Deposit" && t.status === "Success");
        setHasDeposit(found);
      } catch (err) {
        // swallow - checklist should not break dashboard
        // eslint-disable-next-line no-console
        console.error("OnboardingChecklist init error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading || !profile) return null;
  if (dismissed) return null;

  const profileComplete = Boolean(profile.firstName && profile.lastName && (profile.phone || profile.walletAddress));
  const verified = Boolean(profile.isVerified);

  const keyForUser = `${STORAGE_PREFIX}_${profile.id}`;

  function dismiss() {
    try {
      window.localStorage.setItem(keyForUser, "dismissed");
    } catch (e) {
      // ignore
    }
    setDismissed(true);
  }

  return (
    <div className="bg-card border border-[#79797966] rounded-lg p-4 md:p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Get started</h3>
          <p className="text-sm text-muted-foreground">Complete these steps to activate your account</p>
        </div>
        <button aria-label="Dismiss onboarding checklist" onClick={dismiss} className="text-muted-foreground hover:text-foreground">
          <X />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <Step
          title="Complete profile"
          done={profileComplete}
          action={
            <Link className="text-yellow-500 font-medium" href="/dashboard/profile">
              Edit profile
            </Link>
          }
        />

        <Step
          title="Verify identity"
          done={verified}
          action={
            <Link className="text-yellow-500 font-medium" href="/dashboard/kyc">
              Verify now
            </Link>
          }
        />

        <Step
          title="Make first deposit"
          done={hasDeposit}
          action={
            <Link className="text-yellow-500 font-medium" href="/dashboard/deposit">
              Deposit
            </Link>
          }
        />
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Progress is computed from your profile, verification status and transaction history. Dismissed state is stored in localStorage (TODO: persist server-side).
      </p>
    </div>
  );
}

function Step({ title, done, action }: { title: string; done: boolean; action: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`rounded-full p-1 ${done ? "bg-green-100" : "bg-gray-100"}`}>
          {done ? <CheckCircle className="text-green-600" /> : <div className="w-5 h-5 rounded-full bg-gray-300" />}
        </div>
        <div>
          <div className="font-medium">{title}</div>
        </div>
      </div>
      <div>{action}</div>
    </div>
  );
}
