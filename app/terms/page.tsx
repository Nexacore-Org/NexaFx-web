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
  );
}
