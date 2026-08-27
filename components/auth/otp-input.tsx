"use client";

import { useEffect, useRef } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  ariaLabel?: string;
}

export default function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = true,
  ariaLabel = "Verification code",
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = Array.from({ length }, (_, index) => value[index] ?? "");
  const isComplete = digits.every((digit) => digit !== "");

  useEffect(() => {
    if (autoFocus) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const updateDigit = (index: number, nextValue: string) => {
    const nextDigits = [...digits];
    nextDigits[index] = nextValue;
    onChange(nextDigits.join(""));
  };

  const handleChange = (index: number, nextValue: string) => {
    const digit = nextValue.replace(/\D/g, "").slice(-1);
    updateDigit(index, digit);

    if (digit && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (
    event: ClipboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;

    const nextDigits = [...digits];
    pasted
      .slice(0, length - index)
      .split("")
      .forEach((digit, offset) => {
        nextDigits[index + offset] = digit;
      });

    onChange(nextDigits.join(""));

    const nextFocus = Math.min(index + pasted.length, length - 1);
    focusInput(nextFocus);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
    }
    if (event.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    }
    if (event.key === "ArrowRight" && index < length - 1) {
      focusInput(index + 1);
    }
  };

  return (
    <div
      className="grid gap-2 sm:gap-3"
      role="group"
      aria-label={ariaLabel}
      aria-invalid={!isComplete && value.length > 0}
    >
      <div className="flex justify-between gap-2 sm:gap-4">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(event) => handleChange(index, event.target.value)}
            onPaste={(event) => handlePaste(event, index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className="h-14 w-full rounded-xl border-2 border-zinc-100 bg-zinc-50/70 text-center text-2xl font-semibold text-zinc-900 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-50 disabled:cursor-not-allowed disabled:opacity-60 sm:h-16"
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
