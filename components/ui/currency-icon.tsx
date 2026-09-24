"use client";

const FIAT_FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  NGN: "🇳🇬",
  CAD: "🇨🇦",
  AUD: "🇦🇺",
  JPY: "🇯🇵",
};

const CRYPTO_STYLES: Record<
  string,
  { bg: string; letter: string; text?: string }
> = {
  USDC: { bg: "bg-blue-500", letter: "U" },
  ETH: { bg: "bg-purple-600", letter: "Ξ" },
  BTC: { bg: "bg-orange-500", letter: "₿" },
  BNB: { bg: "bg-yellow-500", letter: "B", text: "text-gray-900" },
  SOL: { bg: "bg-gradient-to-br from-purple-500 to-fuchsia-500", letter: "S" },
  XLM: { bg: "bg-blue-900", letter: "X" },
};

export function CurrencyIcon({
  code,
  size = 32,
}: {
  code: string;
  size?: number;
}) {
  const upper = code.toUpperCase();

  if (FIAT_FLAGS[upper]) {
    return (
      <span
        role="img"
        aria-label={`${upper} flag`}
        className="inline-flex items-center justify-center rounded-full bg-muted"
        style={{ width: size, height: size, fontSize: size * 0.55 }}
      >
        {FIAT_FLAGS[upper]}
      </span>
    );
  }

  if (CRYPTO_STYLES[upper]) {
    const { bg, letter, text } = CRYPTO_STYLES[upper];
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full font-bold text-white ${bg} ${text ?? ""}`}
        style={{ width: size, height: size, fontSize: size * 0.45 }}
      >
        {letter}
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center justify-center rounded-full bg-muted font-bold text-muted-foreground"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {upper.charAt(0)}
    </div>
  );
}
