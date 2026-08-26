'use client';

import { evaluatePasswordStrength } from '@/lib/utils/password-strength';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const { score, label, color } = evaluatePasswordStrength(password);

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < score ? color : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Strength: {label}
      </p>
    </div>
  );
}
