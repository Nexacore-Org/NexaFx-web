/**
 * Shared password rules used by signup, reset-password and the
 * Settings > Security change-password form, so every surface enforces the
 * same policy and reports the same messages.
 */

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters" },
  { id: "letter", label: "At least one letter" },
  { id: "number", label: "At least one number" },
] as const;

export type PasswordRuleId = (typeof PASSWORD_RULES)[number]["id"];

export function checkPassword(
  password: string,
): Record<PasswordRuleId, boolean> {
  return {
    length:
      password.length >= MIN_PASSWORD_LENGTH &&
      password.length <= MAX_PASSWORD_LENGTH,
    letter: /[a-zA-Z]/.test(password),
    number: /\d/.test(password),
  };
}

export function failedPasswordRules(password: string): PasswordRuleId[] {
  const checks = checkPassword(password);
  return PASSWORD_RULES.filter((rule) => !checks[rule.id]).map((r) => r.id);
}

export function isValidPassword(password: string): boolean {
  return failedPasswordRules(password).length === 0;
}

export type PasswordStrength = "empty" | "weak" | "fair" | "strong";

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  /** 0-4, used for the meter's bar count. */
  score: number;
  failedRules: PasswordRuleId[];
}

/**
 * Score is driven by satisfied rules first, then length, so a long password
 * that is still missing a number cannot read as "strong".
 */
export function scorePassword(password: string): PasswordStrengthResult {
  if (!password) {
    return { strength: "empty", score: 0, failedRules: [] };
  }

  const checks = checkPassword(password);
  const satisfied = PASSWORD_RULES.filter((rule) => checks[rule.id]).length;
  const failedRules = PASSWORD_RULES.filter((rule) => !checks[rule.id]).map(
    (r) => r.id,
  );

  let score = satisfied;
  if (password.length >= 12) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  score = Math.min(score, 4);

  if (failedRules.length > 0 && score > 2) score = 2;
  if (failedRules.length > 1 && score > 1) score = 1;

  const strength: PasswordStrength =
    score >= 4 ? "strong" : score >= 2 ? "fair" : "weak";

  return { strength, score, failedRules };
}
