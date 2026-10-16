"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type OTPInputProps = {
  maxDigits?: number;
  onSubmit: (code: string) => void;
  onChange?: (code: string) => void;
  resendCount?: number;
  onResend?: () => void;
  disabled?: boolean;
};

export function OTPInput({
  maxDigits = 6,
  onSubmit,
  onChange,
  resendCount = 3,
  onResend,
  disabled = false,
}: OTPInputProps) {
  const [digits, setDigits] = useState<string[]>(() =>
    Array(maxDigits).fill(""),
  );
  const [secondsLeft, setSecondsLeft] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const isCountingDown = secondsLeft > 0;
  const code = useMemo(() => digits.join(""), [digits]);

  useEffect(() => {
    if (!isCountingDown) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isCountingDown]);

  const commit = useCallback(
    (next: string[]) => {
      setDigits(next);
      const value = next.join("");
      onChange?.(value);
      if (value.length === maxDigits && next.every((digit) => digit !== "")) {
        onSubmit(value);
      }
    },
    [maxDigits, onChange, onSubmit],
  );

  const handleChange = useCallback(
    (index: number, raw: string) => {
      const value = raw.replace(/\D/g, "").slice(-1);
      const next = [...digits];
      next[index] = value;
      commit(next);
      if (value && index < maxDigits - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [commit, digits, maxDigits],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (event.key === "Backspace" && digits[index] === "" && index > 0) {
        const next = [...digits];
        next[index - 1] = "";
        commit(next);
        inputRefs.current[index - 1]?.focus();
        event.preventDefault();
      }
      if (event.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      if (event.key === "ArrowRight" && index < maxDigits - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [commit, digits, maxDigits],
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
      if (!pasted) return;
      event.preventDefault();
      const next = Array(maxDigits).fill("");
      for (let i = 0; i < Math.min(pasted.length, maxDigits); i += 1) {
        next[i] = pasted[i];
      }
      commit(next);
      const focusIndex = Math.min(pasted.length, maxDigits - 1);
      inputRefs.current[focusIndex]?.focus();
    },
    [commit, maxDigits],
  );

  const resend = useCallback(() => {
    onResend?.();
    setSecondsLeft(resendCount);
  }, [onResend, resendCount]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      {Array.from({ length: maxDigits }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          maxLength={1}
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label={`OTP digit ${i + 1} of ${maxDigits}`}
          value={digits[i] ?? ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          style={{
            width: "40px",
            height: "40px",
            fontSize: "24px",
            textAlign: "center",
            border: "1px solid #ccc",
            borderRadius: "4px",
            display: "inline-block",
          }}
        />
      ))}

      <button
        type="button"
        onClick={resend}
        disabled={isCountingDown || !onResend}
        style={{ marginLeft: "8px", padding: "4px 8px", fontSize: "12px" }}
      >
        {isCountingDown ? `Resend in ${secondsLeft}s` : "Resend code"}
      </button>

      <span
        aria-live="polite"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        {isCountingDown
          ? `You can resend the code in ${secondsLeft} seconds`
          : ""}
        {code.length === maxDigits ? "Code complete" : ""}
      </span>
    </div>
  );
}
