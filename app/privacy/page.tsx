export const metadata = {
  title: "Privacy Policy | NexaFx",
  description: "NexaFx privacy policy",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 prose dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p>
        This Privacy Policy describes how NexaFx collects, uses, and protects
        personal information when you use our services.
      </p>
      <h2>1. Information we collect</h2>
      <p>
        Account details (email, phone), verification data required by
        regulation, and technical logs needed to operate the service securely.
      </p>
      <h2>2. How we use information</h2>
      <p>
        We use data to provide the product, prevent fraud, meet legal
        obligations, and improve reliability and support.
      </p>
      <h2>3. Sharing</h2>
      <p>
        We do not sell personal information. We may share data with processors
        that help us operate the service under appropriate contracts, or when
        required by law.
      </p>
      <h2>4. Contact</h2>
      <p>
        Privacy requests can be submitted through the in-app support channel.
      </p>
    </main>
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — NexaFx",
};

// TODO: Replace with the final, legally reviewed privacy policy.
export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-2xl font-semibold mb-4">Privacy Policy</h1>
      <p className="text-sm text-gray-600 mb-4">
        Our full privacy policy is being finalised and will be published here
        soon. It will describe what personal data NexaFx collects, how it is
        used and stored, and the rights you have over it.
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
