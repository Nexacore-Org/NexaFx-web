import { PrivacyPolicyData } from "../types/privacy-policy";

const MOCK_PRIVACY_POLICY_DATA: PrivacyPolicyData = {
  lastUpdated: "March 19, 2025",
  sections: [
    {
      title: "1. Introduction",
      content: [
        "At NexaFX, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.",
        "Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the platform.",
      ],
    },
    {
      title: "2. Information We Collect",
      content: [],
      subsections: [
        {
          title: "Personal Data:",
          content: [
            "We collect personal information that you voluntarily provide to us when you register on the platform, express interest in obtaining information about us or our products and services, or otherwise contact us.",
            "The personal information we collect may include:",
          ],
          listItems: [
            "Name, email address, phone number, and address",
            "Financial information necessary for transactions",
            "Government-issued identification for KYC compliance",
            "Transaction history and account details",
            "Any other information you choose to provide",
          ],
        },
        {
          title: "Automatically Collected Data:",
          content: [
            "We automatically collect certain information when you visit, use, or navigate the platform. This information does not reveal your specific identity but may include device and usage information, IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, and other technical information.",
          ],
        },
      ],
    },
    {
      title: "3. How We Use Your Information",
      content: ["We use the information we collect or receive:"],
      listItems: [
        "To facilitate account creation and authentication",
        "To process your transactions and manage your account",
        "To comply with legal and regulatory requirements",
        "To provide customer support and respond to inquiries",
        "To send administrative information and updates",
        "To send marketing and promotional communications (with your consent)",
        "To protect our platform and users from fraudulent activity",
        "To improve our platform and user experience",
      ],
    },
    {
      title: "4. Disclosure of Your Information",
      content: ["We may share your information in the following situations:"],
      listItems: [
        "Compliance with Laws: We may disclose your information where required by law or to comply with legal processes.",
        "Business Transfers: We may share information in connection with a merger, sale of company assets, financing, or acquisition.",
        "Third-Party Service Providers: We may share your information with third-party vendors, service providers, and other partners who help us provide our services.",
        "With Your Consent: We may disclose your information for any other purpose with your consent.",
      ],
    },
    {
      title: "5. Security of Your Information",
      content: [
        "We use administrative, technical, and physical security measures to protect your personal information. While we have taken reasonable steps to secure the information you provide to us, please be aware that no security measures are perfect or impenetrable, and we cannot guarantee the security of your information.",
      ],
    },
    {
      title: "6. Data Retention",
      content: [
        "We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy, or as required to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies.",
      ],
    },
    {
      title: "7. Your Privacy Rights",
      content: [
        "Depending on your location, you may have certain rights regarding your personal information, such as:",
      ],
      listItems: [
        "The right to access the personal information we have about you",
        "The right to request correction of inaccurate personal information",
        "The right to request deletion of your personal information",
        "The right to object to processing of your personal information",
        "The right to data portability",
        "The right to withdraw consent",
      ],
    },
    {
      title: "8. Changes to This Privacy Policy",
      content: [
        'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.',
      ],
    },
  ],
  contactInfo: {
    email: "privacy@nexafx.com",
    address: "NexaFX Headquarters, 123 Financial District, Lagos, Nigeria",
  },
};

export async function fetchPrivacyPolicy(): Promise<PrivacyPolicyData> {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simular respuesta de API
  return MOCK_PRIVACY_POLICY_DATA;
}
