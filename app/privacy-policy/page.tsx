import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className='px-14 py-8'>
      <Link
        href='/'
        className='text-gray-600 hover:text-gray-800 mb-8 inline-block text-sm'
      >
        ← Back to home
      </Link>

      <div className='max-w-3xl mx-auto '>
        <h1 className='text-3xl font-bold mb-6'>Privacy Policy</h1>
        <p className='text-sm text-gray-600 mb-8'>
          Last updated: March 19, 2025
        </p>

        <section className='space-y-6'>
          <div>
            <h2 className='text-xl font-bold mb-3'>1. Introduction</h2>
            <p className='text-gray-700'>
              At NexaFX, we respect your privacy and are committed to protecting
              your personal data. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our
              platform.
            </p>
            <p className='text-gray-700 mt-2'>
              Please read this Privacy Policy carefully. If you do not agree
              with the terms of this Privacy Policy, please do not access the
              platform.
            </p>
          </div>

          <div>
            <h2 className='text-xl font-bold mb-3'>
              2. Information We Collect
            </h2>
            <div className='space-y-4'>
              <div>
                <h3 className='font-bold'>Personal Data:</h3>
                <p className='text-gray-700'>
                  We collect personal information that you voluntarily provide
                  to us when you register on the platform, express interest in
                  obtaining information about us or our products and services,
                  or otherwise contact us.
                </p>
                <p className='text-gray-700 mt-2'>
                  The personal information we collect may include:
                </p>
                <ul className='list-disc list-inside ml-4 mt-2 text-gray-700'>
                  <li>Name, email address, phone number, and address</li>
                  <li>Financial information necessary for transactions</li>
                  <li>Government-issued identification for KYC compliance</li>
                  <li>Transaction history and account details</li>
                  <li>Any other information you choose to provide</li>
                </ul>
              </div>

              <div>
                <h3 className='font-bold'>Automatically Collected Data:</h3>
                <p className='text-gray-700'>
                  We automatically collect certain information when you visit,
                  use, or navigate the platform. This information does not
                  reveal your specific identity but may include device and usage
                  information, IP address, browser and device characteristics,
                  operating system, language preferences, referring URLs, device
                  name, country, location, and other technical information.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className='text-xl font-bold mb-3'>
              3. How We Use Your Information
            </h2>
            <p className='text-gray-700'>
              We use the information we collect or receive:
            </p>
            <ul className='list-disc list-inside ml-4 mt-2 text-gray-700'>
              <li>To facilitate account creation and authentication</li>
              <li>To process your transactions and manage your account</li>
              <li>To comply with legal and regulatory requirements</li>
              <li>To provide customer support and respond to inquiries</li>
              <li>To send administrative information and updates</li>
              <li>
                To send marketing and promotional communications (with your
                consent)
              </li>
              <li>
                To protect our platform and users from fraudulent activity
              </li>
              <li>To improve our platform and user experience</li>
            </ul>
          </div>

          <div>
            <h2 className='text-xl font-bold mb-3'>
              4. Disclosure of Your Information
            </h2>
            <p className='text-gray-700'>
              We may share your information in the following situations:
            </p>
            <ul className='list-disc list-inside ml-4 mt-2 text-gray-700'>
              <li>
                <span className='font-bold'>Compliance with Laws:</span> We may
                disclose your information where required by law or to comply
                with legal processes.
              </li>
              <li>
                <span className='font-bold'>Business Transfers:</span> We may
                share information in connection with a merger, sale of company
                assets, financing, or acquisition.
              </li>
              <li>
                <span className='font-bold'>
                  Third-Party Service Providers:
                </span>{' '}
                We may share your information with third-party vendors, service
                providers, and other partners who help us provide our services.
              </li>
              <li>
                <span className='font-bold'>With Your Consent:</span> We may
                disclose your information for any other purpose with your
                consent.
              </li>
            </ul>
          </div>

          <div>
            <h2 className='text-xl font-bold mb-3'>
              5. Security of Your Information
            </h2>
            <p className='text-gray-700'>
              We use administrative, technical, and physical security measures
              to protect your personal information. While we have taken
              reasonable steps to secure the information you provide to us,
              please be aware that no security measures are perfect or
              impenetrable, and we cannot guarantee the security of your
              information.
            </p>
          </div>

          <div>
            <h2 className='text-xl font-bold mb-3'>6. Data Retention</h2>
            <p className='text-gray-700'>
              We will retain your personal information only for as long as is
              necessary for the purposes set out in this Privacy Policy, or as
              required to comply with our legal obligations, resolve disputes,
              and enforce our legal agreements and policies.
            </p>
          </div>

          <div>
            <h2 className='text-xl font-bold mb-3'>7. Your Privacy Rights</h2>
            <p className='text-gray-700'>
              Depending on your location, you may have certain rights regarding
              your personal information, such as:
            </p>
            <ul className='list-disc list-inside ml-4 mt-2 text-gray-700'>
              <li>
                The right to access the personal information we have about you
              </li>
              <li>
                The right to request correction of inaccurate personal
                information
              </li>
              <li>
                The right to request deletion of your personal information
              </li>
              <li>
                The right to object to processing of your personal information
              </li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>
            <p className='text-gray-700 mt-2'>
              To exercise these rights, please contact us using the details
              provided below.
            </p>
          </div>

          <div>
            <h2 className='text-xl font-bold mb-3'>
              8. Changes to This Privacy Policy
            </h2>
            <p className='text-gray-700'>
              {`We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last updated" date. You are advised to review this
            Privacy Policy periodically for any changes.`}
            </p>
          </div>

          <div>
            <h2 className='text-xl font-bold mb-3'>9. Contact Us</h2>
            <p className='text-gray-700'>
              If you have questions or concerns about this Privacy Policy,
              please contact us at:
            </p>
            <p className='mt-2'>
              <strong>Email:</strong>{' '}
              <a
                href='mailto:privacy@nexafx.com'
                className='text-blue-600 hover:text-blue-800'
              >
                privacy@nexafx.com
              </a>
            </p>
            <p className='mt-1'>
              <strong>Address:</strong> NexaFX Headquarters, 123 Financial
              District, Lagos, Nigeria
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
