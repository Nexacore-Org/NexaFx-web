import Image from "next/image";
import { formatCode, getCurrency } from "@/lib/currencies";

export function CurrencyIcon({ code }: { code: string }) {
  const currency = getCurrency(code);

  if (currency && currency.icon) {
    return (
      <Image
        src={currency.icon}
        alt={`${currency.name} icon`}
        width={20}
        height={20}
        style={{ display: "inline-block" }}
      />
    );
  }

  // Fallback to a generic badge with the code
  return (
    <span
      style={{
        display: "inline-block",
        background: "#e5e7eb",
        color: "#1f2937",
        borderRadius: "4px",
        padding: "2px 6px",
        fontSize: "12px",
        fontFamily: "monospace",
      }}
    >
      {formatCode(code)}
    </span>
  );
}
