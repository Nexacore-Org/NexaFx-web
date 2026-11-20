"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTwoFactorStatus, regenerateBackupCodes, TwoFactorInvalidCodeError } from "../../lib/api/two-factor";
import { Dialog } from "../ui/dialog";
import { BackupCodesStep } from "./two-factor";
import { FormError } from "./settings-section";

export const LOW_CODES = 3;

export default function BackupCodesManager() {
  const queryClient = useQueryClient();
  const status = useQuery({ queryKey: ["two-factor", "status"], queryFn: fetchTwoFactorStatus });
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState<string[] | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const info = status.data?.enabled ? status.data.info : null;
  if (!info) return null;

  const close = () => { setOpen(false); setCode(""); setCodes(null); setSaved(false); setError(null); };
  const regenerate = async () => {
    setError(null);
    try {
      setCodes((await regenerateBackupCodes(code)).codes);
      void queryClient.invalidateQueries({ queryKey: ["two-factor", "status"] });
    } catch (err) {
      setError(err instanceof TwoFactorInvalidCodeError ? "That code is not valid." : "Could not regenerate backup codes.");
    }
  };
  const remaining = info.backupCodesRemaining;

  return (
    <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
      {info.enabledAt && <p>Enabled on <time dateTime={info.enabledAt}>{new Date(info.enabledAt).toDateString()}</time></p>}
      {remaining !== null && <p>{remaining} backup codes remaining</p>}
      {remaining !== null && remaining <= LOW_CODES && (
        <p role="alert" className="text-amber-700">You are running low on backup codes. Regenerate a new set.</p>
      )}
      <button type="button" onClick={() => setOpen(true)} className="rounded border px-3 py-1">Regenerate backup codes</button>
      <Dialog open={open} onClose={close} title="Regenerate backup codes" description="Your existing backup codes will stop working.">
        {codes ? (
          <div className="space-y-3">
            <BackupCodesStep codes={codes} saved={saved} onChange={setSaved} />
            <button type="button" disabled={!saved} onClick={close} className="rounded border px-3 py-1 disabled:opacity-50">Done</button>
          </div>
        ) : (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); void regenerate(); }}>
            <label className="block" htmlFor="regen-code">Authenticator code</label>
            <input id="regen-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className="w-full rounded border px-3 py-2" />
            <FormError message={error} />
            <button type="submit" disabled={code.length !== 6} className="rounded border px-3 py-1 disabled:opacity-50">Regenerate</button>
          </form>
        )}
      </Dialog>
    </div>
  );
}
