import Image from "next/image";

type AvatarSize = "sm" | "md" | "lg";

const SIZES: Record<AvatarSize, { px: number; text: string }> = {
  sm: { px: 32, text: "text-xs" },
  md: { px: 40, text: "text-sm" },
  lg: { px: 64, text: "text-xl" },
};

// Deterministic palette so the same initials always get the same colour.
const COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-purple-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
];

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % COLORS.length;
  }
  return COLORS[hash];
}

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  /** Set when the avatar is the only content conveying the user's name. */
  alt?: string;
}

export function Avatar({ name, src, size = "md", alt }: AvatarProps) {
  const { px, text } = SIZES[size];
  const initials = initialsFromName(name);
  const label = alt ?? name;

  if (src) {
    return (
      <Image
        src={src}
        alt={label}
        width={px}
        height={px}
        className="rounded-full object-cover"
        style={{ width: px, height: px }}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={label}
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${colorForName(
        name,
      )} ${text}`}
      style={{ width: px, height: px }}
    >
      {initials}
    </span>
  );
}
