export const metadata = {
  title: "Terms of Service | NexaFx",
  description: "NexaFx terms of service",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 prose dark:prose-invert">
      <h1>Terms of Service</h1>
      <p>
        These Terms of Service govern your use of NexaFx. By creating an account
        or using the platform, you agree to these terms.
      </p>
      <h2>1. Eligibility</h2>
      <p>
        You must be able to form a binding contract in your jurisdiction and
        complete any required identity verification before moving funds.
      </p>
      <h2>2. Account security</h2>
      <p>
        You are responsible for safeguarding your credentials and for all
        activity under your account.
      </p>
      <h2>3. Transactions</h2>
      <p>
        Withdrawals and transfers are subject to network fees, limits, and
        compliance checks. Once submitted to the network, blockchain
        transactions may be irreversible.
      </p>
      <h2>4. Contact</h2>
      <p>
        For questions about these terms, contact support through the in-app
        help channel.
      </p>
    </main>
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — NexaFx",
};

// TODO: Replace with the final, legally reviewed terms of service.
export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-2xl font-semibold mb-4">Terms of Service</h1>
      <p className="text-sm text-gray-600 mb-4">
        Our full terms of service are being finalised and will be published
        here soon. They will set out the conditions for using NexaFx, including
        account, exchange and transfer rules.
      </p>
      <p className="text-sm text-gray-600">
        Questions in the meantime? Reach us through{" "}
        <Link href="/dashboard/support" className="text-yellow-600 hover:underline">
          Support
        </Link>
        .
      </p>
    </div>
  );
}
