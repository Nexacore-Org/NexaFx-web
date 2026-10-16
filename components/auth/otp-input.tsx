"use client";

import { useState, useCallback, useEffect, useRef } from "react";

type OTPInputProps = {
  maxDigits?: number;
  onSubmit: (code: string) => void;
  onChange?: (code: string | null) => void;
  resendCount?: number;
  onResend?: () => void;
  resendDisabled?: boolean;
};

export const OTPInput = ({
  maxDigits = 6,
  onSubmit,
  onChange,
  resendCount = 3,
  onResend,
  resendDisabled = false,
}: OTPInputProps) => {
  const [digits, setDigits] = useState<string[]>([]);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const submit = useCallback(
    (next: string[]) => {
      const code = next.join("");
      onChange?.(code.length === maxDigits ? code : null);
      if (code.length === maxDigits) {
        setDigits([]);
        onChange?.(null);
        onSubmit(code);
      }
    },
    [maxDigits, onChange, onSubmit],
  );

  const handleChange = useCallback(
    (index: number, raw: string) => {
      const value = raw.replace(/\D/g, "");
      if (!value) return;

      // Support multi-character input (mobile autofill / paste).
      const next = [...digits];
      let cursor = index;
      for (const char of value.slice(0, maxDigits - index)) {
        next[cursor] = char;
        cursor += 1;
      }
      setDigits(next);

      if (cursor <= maxDigits) {
        inputsRef.current[cursor - 1]?.focus();
      }
      if (next.filter(Boolean).length === maxDigits) {
        submit(next);
      }
    },
    [digits, maxDigits, submit],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (event.key === "Backspace") {
        event.preventDefault();
        const next = [...digits];
        if (next[index]) {
          next[index] = "";
        } else if (index > 0) {
          next[index - 1] = "";
          inputsRef.current[index - 1]?.focus();
        }
        setDigits(next);
        onChange?.(null);
      } else if (event.key === "ArrowLeft" && index > 0) {
        event.preventDefault();
        inputsRef.current[index - 1]?.focus();
      } else if (event.key === "ArrowRight" && index < maxDigits - 1) {
        event.preventDefault();
        inputsRef.current[index + 1]?.focus();
      }
    },
    [digits, maxDigits, onChange],
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      const text = (event.clipboardData.getData("text") || "").replace(
        /\D/g,
        "",
      );
      if (!text) return;
      const next = text.slice(0, maxDigits).split("");
      setDigits(next);
      onChange?.(text.length >= maxDigits ? null : text);
      if (text.length >= maxDigits) {
        onSubmit(text.slice(0, maxDigits));
      } else {
        inputsRef.current[text.length]?.focus();
      }
    },
    [maxDigits, onChange, onSubmit],
  );

  const resendLocked = resendDisabled || cooldown > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {Array.from({ length: maxDigits }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          maxLength={maxDigits}
          inputMode="numeric"
          pattern="\d*"
          autoComplete="one-time-code"
          disabled={resendDisabled}
          aria-label={`Digit ${i + 1} of ${maxDigits}`}
          value={digits[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          className="h-10 w-10 rounded border border-zinc-300 text-center text-xl dark:border-zinc-700 dark:bg-zinc-900"
        />
      ))}

      {onResend && resendCount > 0 && (
        <button
          type="button"
          onClick={() => {
            setCooldown(resendCount);
            onResend();
          }}
          disabled={resendLocked}
          className="ml-2 text-sm text-zinc-600 underline disabled:opacity-50 dark:text-zinc-400"
        >
          {resendDisabled
            ? "Resend unavailable"
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend code"}
        </button>
      )}
    </div>
  );
};
