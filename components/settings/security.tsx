"use client";

import { WebAuthnSection } from "./webauthn-section";

export function Security() {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="px-5 pt-6 pb-4 border-b border-border">
        <h2 className="text-base font-semibold text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account security settings.
        </p>
      </div>

      <div className="px-5 py-6 space-y-6">
        <div className="flex max-sm:flex-col max-sm:items-start justify-between items-center gap-6">
          <div className="max-w-lg">
            <h3 className="text-foreground font-semibold text-[15px] sm:text-lg">
              Change Password
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Update your password to keep your account secure.
            </p>
          </div>
          <p
            className="text-sm text-muted-foreground italic shrink-0"
            role="status"
          >
            Password changes are not yet supported
          </p>
        </div>

        <div className="border-t border-border pt-6">
          <div className="max-w-lg mb-4">
            <h3 className="text-foreground font-semibold text-[15px] sm:text-lg">
              Sign in with Face ID / Touch ID
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Enroll a biometric credential on this device for faster,
              phishing-resistant sign-in.
            </p>
          </div>
          <WebAuthnSection />
        </div>
      </div>
    </div>
  );
}
