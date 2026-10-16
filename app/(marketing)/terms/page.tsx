import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 prose">
      <h1>Terms of Service</h1>
      <p>Last updated: 2026</p>
      <h2>1. Agreement to Terms</h2>
      <p>
        By accessing or using the NexaFx service, you agree to be bound by these
        Terms of Service and all policies referenced herein.
      </p>
      <h2>2. Account Registration</h2>
      <p>
        To use certain features of the service, you must register for an account
        and provide accurate, complete information. You are responsible for
        safeguarding your account credentials and for all activity that occurs
        under your account.
      </p>
      <h2>3. Service Description</h2>
      <p>
        NexaFx provides financial services including but not limited to account
        management, currency exchange, and payment processing. The specific
        services available to you may vary by region and account status.
      </p>
      <h2>4. User Responsibilities</h2>
      <p>
        You agree to use the service only for lawful purposes and in accordance
        with these Terms. You will not engage in any fraudulent or deceptive
        activity.
      </p>
      <h2>5. Fees and Charges</h2>
      <p>
        Certain transactions may be subject to fees. All applicable fees will be
        disclosed to you before you confirm a transaction.
      </p>
      <h2>6. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, NexaFx shall not be liable for
        any indirect, incidental, special, consequential, or punitive damages
        arising out of or relating to your use of the service.
      </p>
      <h2>7. Changes to Terms</h2>
      <p>
        We may update these Terms from time to time. We will notify you of any
        material changes and your continued use of the service after such
        changes constitutes acceptance of the updated Terms.
      </p>
    </article>
  );
}
