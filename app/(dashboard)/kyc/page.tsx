import { KycStatusView } from "@/components/kyc/kyc-status";

export const metadata = {
  title: "Identity Verification (KYC) - NexaFx",
  description:
    "Verify your identity to increase transaction limits and unlock account features.",
};

export default function KycPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
          Identity Verification
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Check your current KYC status, review account limits, or submit
          verification documents.
        </p>
      </div>

      <KycStatusView />
    </div>
  );
}
