import type { NotificationCategory } from "@/lib/api/notifications";

const styles: Record<NotificationCategory, string> = {
  transactions: "bg-blue-50 text-blue-600",
  security: "bg-amber-50 text-amber-600",
  promotions: "bg-purple-50 text-purple-600",
  system: "bg-gray-100 text-gray-600",
};

function Paths({ category }: { category: NotificationCategory }) {
  switch (category) {
    case "transactions":
      return <path d="M4 7h13M4 7l4-4M20 17H7m13 0-4 4" />;
    case "security":
      return (
        <>
          <path d="M12 3l7 3v6c0 4-3 7-7 8-4-1-7-4-7-8V6z" />
          <path d="m9 12 2 2 4-4" />
        </>
      );
    case "promotions":
      return (
        <>
          <path d="M20 12v7H4v-7" />
          <path d="M2 7h20v5H2zM12 7v12" />
        </>
      );
    default:
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8h.01M11 12h1v4h1" />
        </>
      );
  }
}

export function CategoryIcon({ category }: { category: NotificationCategory }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${styles[category]}`}
      aria-hidden="true"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Paths category={category} />
      </svg>
    </span>
  );
}
