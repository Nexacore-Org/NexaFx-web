"use client";

import { PASSWORD_RULES, scorePassword } from "../../lib/password";

const LABELS: Record<string, string> = {
  empty: "Enter a password",
  weak: "Weak",
  fair: "Fair",
  strong: "Strong",
};

const BAR_COLORS: Record<string, string> = {
  empty: "#e4e4e7",
  weak: "#ef4444",
  fair: "#f59e0b",
  strong: "#16a34a",
};

/**
 * Password strength feedback, driven by the shared rules in lib/password.ts.
 * The score is exposed via aria-valuenow so assistive tech can announce it
 * without relying on the bar colours.
 */
export function PasswordStrengthMeter({
  value,
  id,
}: {
  value: string;
  id?: string;
}) {
  const { strength, score, failedRules } = scorePassword(value);
  const color = BAR_COLORS[strength];
  const label = LABELS[strength];

  return (
    <div className="mt-2 space-y-2">
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={score}
        aria-valuetext={label}
        aria-labelledby={id ? `${id}-strength-label` : undefined}
        aria-label={id ? undefined : "Password strength"}
        className="flex gap-1"
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: "4px",
              flex: 1,
              borderRadius: "2px",
              backgroundColor: i < score ? color : "#e4e4e7",
            }}
          />
        ))}
      </div>

      <p id={id ? `${id}-strength-label` : undefined} className="text-xs">
        <span style={{ color }}>{label}</span>
        {value && failedRules.length > 0 && (
          <span className="ml-2 text-zinc-500">
            {PASSWORD_RULES.filter((r) => failedRules.includes(r.id))
              .map((r) => r.label)
              .join(", ")}
          </span>
        )}
      </p>
    </div>
  );
}
