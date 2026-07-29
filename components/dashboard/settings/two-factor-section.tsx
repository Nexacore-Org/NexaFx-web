"use client"

import { useState, useEffect } from "react"
import { Shield, ShieldOff, Loader2 } from "lucide-react"
import { TwoFactorSetupModal } from "./two-factor-setup-modal"

export function TwoFactorSection() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showSetup, setShowSetup] = useState(false)
  const [showDisablePrompt, setShowDisablePrompt] = useState(false)

  useEffect(() => {
    // Check 2FA status from user profile or store
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <div className="flex max-sm:flex-col max-sm:items-start justify-between items-center gap-6 px-5 py-5">
        <div className="max-w-124.25">
          <h4 className="text-foreground font-semibold text-[15px] sm:text-lg flex items-center gap-2">
            {is2FAEnabled ? <Shield className="h-5 w-5 text-green-500" /> : <ShieldOff className="h-5 w-5 text-muted-foreground" />}
            Two-Factor Authentication
          </h4>
          <p className="text-[12px] text-muted-foreground font-normal mt-1">
            {is2FAEnabled
              ? "Two-factor authentication is enabled on your account."
              : "Add an extra layer of security to your account."}
          </p>
        </div>
        <button
          onClick={() => (is2FAEnabled ? setShowDisablePrompt(true) : setShowSetup(true))}
          className={`shrink-0 rounded-[19px] px-5 h-7 cursor-pointer text-[14px] font-semibold ${
            is2FAEnabled
              ? "border border-border text-foreground hover:bg-muted"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {is2FAEnabled ? "Disable" : "Enable"}
        </button>
      </div>

      {showSetup && <TwoFactorSetupModal onClose={() => setShowSetup(false)} onEnabled={() => { setIs2FAEnabled(true); setShowSetup(false) }} />}

      {showDisablePrompt && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowDisablePrompt(false)} />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-card rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
              <h3 className="text-base font-semibold text-center text-foreground">Disable 2FA?</h3>
              <p className="text-sm text-muted-foreground text-center">Your account will be less secure without two-factor authentication.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDisablePrompt(false)}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowDisablePrompt(false); setShowSetup(true) }}
                  className="flex-1 py-2.5 rounded-lg bg-destructive text-white text-sm font-semibold hover:bg-destructive/90"
                >
                  Disable
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
