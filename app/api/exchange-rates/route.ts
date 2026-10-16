import { NextResponse } from "next/server";

const DEFAULT_PAIRS = ["XLM/USD", "USDC/NGN", "BTC/USD"];

// Deterministic fallback quotes so the dashboard works without a backend.
const FALLBACK: Record<string, { rate: number; change24h: number }> = {
  "XLM/USD": { rate: 0.112, change24h: 1.84 },
  "USDC/NGN": { rate: 1587.4, change24h: -0.42 },
  "BTC/USD": { rate: 64210.55, change24h: 2.63 },
  "ETH/USD": { rate: 3120.18, change24h: -1.07 },
  "NGN/USD": { rate: 0.00063, change24h: 0 },
};

interface RateQuote {
  pair: string;
  rate: number;
  change24h: number;
  currency: string;
}

async function fetchFromBackend(pairs: string[]): Promise<RateQuote[] | null> {
  const endpoint = process.env.EXCHANGE_RATES_API_URL;
  if (!endpoint) return null;

  try {
    const res = await fetch(
      `${endpoint}?pairs=${encodeURIComponent(pairs.join(","))}`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { quotes?: RateQuote[] };
    return Array.isArray(data.quotes) ? data.quotes : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requested = searchParams.get("pairs");
  const pairs = (requested ? requested.split(",") : DEFAULT_PAIRS)
    .map((pair) => pair.trim().toUpperCase())
    .filter(Boolean);

  const backendQuotes = await fetchFromBackend(pairs);

  const quotes: RateQuote[] =
    backendQuotes ??
    pairs.map((pair) => {
      const fallback = FALLBACK[pair] ?? { rate: 1, change24h: 0 };
      const currency = pair.split("/")[1] ?? "";
      return { pair, currency, ...fallback };
    });

  return NextResponse.json({ quotes, updatedAt: new Date().toISOString() });
}
