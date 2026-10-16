import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 prose">
      <h1>Privacy Policy</h1>
      <p>Last updated: 2026</p>
      <h2>1. Information We Collect</h2>
      <p>
        We collect information you provide directly to us, such as when you
        create an account, make a transaction, or contact support. This may
        include your name, email address, phone number, and financial
        information.
      </p>
      <h2>2. How We Use Your Information</h2>
      <p>
        We use the information we collect to operate, maintain, and provide the
        features of the service, to process transactions, to communicate with
        you, and to comply with legal obligations.
      </p>
      <h2>3. Information Sharing</h2>
      <p>
        We do not sell your personal information. We may share your information
        with third-party service providers who assist us in operating the
        service, or when required by law.
      </p>
      <h2>4. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to
        protect your personal information against unauthorized access,
        alteration, disclosure, or destruction.
      </p>
      <h2>5. Your Rights</h2>
      <p>
        You have the right to access, correct, or delete your personal
        information. You may also request a copy of your data or object to
        certain uses of your information.
      </p>
      <h2>6. Cookies</h2>
      <p>
        We use cookies and similar technologies to enhance your experience. You
        can control cookies through your browser settings.
      </p>
      <h2>7. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us
        through the support channels provided in the app.
      </p>
    </article>
  );
}
