const COMMON_PASSWORDS = [
  "password",
  "12345678",
  "qwerty",
  "admin",
  "letmein",
  "welcome",
];

const SPECIAL_CHARS = /[!@#$%^&*]/;

const LABELS: Record<number, string> = {
  0: "Very Weak",
  1: "Weak",
  2: "Fair",
  3: "Strong",
  4: "Very Strong",
};

const COLORS: Record<number, string> = {
  0: "bg-red-500",
  1: "bg-orange-500",
  2: "bg-yellow-500",
  3: "bg-lime-500",
  4: "bg-green-500",
};

export function evaluatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    return { score: 0, label: LABELS[0], color: COLORS[0] };
  }

  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  ) {
    score += 1;
  }
  if (SPECIAL_CHARS.test(password)) score += 1;

  return { score, label: LABELS[score], color: COLORS[score] };
}
