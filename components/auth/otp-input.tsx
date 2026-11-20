"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

interface OTPInputProps {
  maxDigits?: number;
  onSubmit?: (code: string) => void;
  onResend?: () => void;
  cooldownSeconds?: number;
  disabled?: boolean;
}

export const OTPInput = forwardRef<HTMLDivElement, OTPInputProps>(
  function OTPInput(
    {
      maxDigits = 6,
      onSubmit,
      onResend,
      cooldownSeconds = 30,
      disabled = false,
    },
    ref,
  ) {
    const [digits, setDigits] = useState<string[]>(() =>
      Array(maxDigits).fill(""),
    );
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [announcement, setAnnouncement] = useState("");
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
      if (secondsLeft <= 0) return;
      const timer = setTimeout(() => {
        setSecondsLeft((prev) => {
          const next = prev - 1;
          if (next === 0) setAnnouncement("You can now resend the code.");
          return next;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }, [secondsLeft]);

    const focusInput = (index: number) => {
      const clamped = Math.max(0, Math.min(index, maxDigits - 1));
      inputsRef.current[clamped]?.focus();
    };

    const commit = (next: string[]) => {
      setDigits(next);
      const code = next.join("");
      if (code.length === maxDigits && !next.includes("")) {
        onSubmit?.(code);
      }
    };

    const applyValue = (raw: string, startIndex: number) => {
      const chars = raw.replace(/\D/g, "").split("");
      if (chars.length === 0) return;
      const next = [...digits];
      let cursor = startIndex;
      for (const char of chars) {
        if (cursor >= maxDigits) break;
        next[cursor] = char;
        cursor += 1;
      }
      commit(next);
      focusInput(cursor);
    };

    const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value.length > 1) {
        applyValue(value, index);
        return;
      }
      const char = value.replace(/\D/g, "");
      const next = [...digits];
      next[index] = char;
      commit(next);
      if (char) focusInput(index + 1);
    };

    const handleKeyDown = (
      index: number,
      e: KeyboardEvent<HTMLInputElement>,
    ) => {
      if (e.key === "Backspace") {
        if (digits[index]) {
          const next = [...digits];
          next[index] = "";
          commit(next);
        } else if (index > 0) {
          const next = [...digits];
          next[index - 1] = "";
          commit(next);
          focusInput(index - 1);
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        focusInput(index - 1);
      } else if (e.key === "ArrowRight" && index < maxDigits - 1) {
        focusInput(index + 1);
      }
    };

    const handlePaste = (
      index: number,
      e: ClipboardEvent<HTMLInputElement>,
    ) => {
      e.preventDefault();
      applyValue(e.clipboardData.getData("text"), index);
    };

    const handleResend = () => {
      if (secondsLeft > 0 || disabled) return;
      onResend?.();
      setSecondsLeft(cooldownSeconds);
      setAnnouncement(
        `Code resent. You can resend again in ${cooldownSeconds} seconds.`,
      );
    };

    return (
      <div ref={ref}>
        <div role="group" aria-label="One-time code">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={maxDigits}
              value={digit}
              disabled={disabled}
              aria-label={`Digit ${index + 1}`}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => handlePaste(index, e)}
            />
          ))}
        </div>
        <div aria-live="polite" role="status">
          {announcement}
        </div>
        {onResend && (
          <button
            type="button"
            onClick={handleResend}
            disabled={disabled || secondsLeft > 0}
          >
            {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend code"}
          </button>
        )}
      </div>
    );
  },
);
