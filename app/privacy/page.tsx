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
