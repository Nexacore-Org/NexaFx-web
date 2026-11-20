import type { NavIconKey } from "@/lib/navigation";

type IconProps = { className?: string };

function Svg({
  children,
  className,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const icons: Record<NavIconKey, (props: IconProps) => React.ReactElement> = {
  dashboard: (props) => (
    <Svg {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </Svg>
  ),
  convert: (props) => (
    <Svg {...props}>
      <path d="M4 7h13" />
      <path d="m13 3 4 4-4 4" />
      <path d="M20 17H7" />
      <path d="m11 21-4-4 4-4" />
    </Svg>
  ),
  transactions: (props) => (
    <Svg {...props}>
      <path d="M4 5h16v14H4z" />
      <path d="M8 9h8M8 13h5" />
    </Svg>
  ),
  notifications: (props) => (
    <Svg {...props}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </Svg>
  ),
  beneficiaries: (props) => (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5" />
      <path d="M18 14a6 6 0 0 1 3 6" />
    </Svg>
  ),
  alerts: (props) => (
    <Svg {...props}>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </Svg>
  ),
  schedules: (props) => (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </Svg>
  ),
  kyc: (props) => (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M6 16a3 3 0 0 1 6 0" />
      <path d="M14 10h4M14 14h3" />
    </Svg>
  ),
  settings: (props) => (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </Svg>
  ),
  developer: (props) => (
    <Svg {...props}>
      <path d="m8 8-4 4 4 4" />
      <path d="m16 8 4 4-4 4" />
      <path d="m13 5-2 14" />
    </Svg>
  ),
};

export function NavIcon({
  name,
  className,
}: {
  name: NavIconKey;
  className?: string;
}) {
  return icons[name]({ className });
}
