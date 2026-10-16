import { apiRequest } from "@/lib/api-client";

export interface RateQuote {
  pair: string;
  rate: number;
  change24h: number;
  currency: string;
}

export interface RatesResponse {
  quotes: RateQuote[];
  updatedAt: string;
}

export const DEFAULT_PAIRS = ["XLM/USD", "USDC/NGN", "BTC/USD"];

export async function getRates(
  pairs: string[] = DEFAULT_PAIRS,
): Promise<RatesResponse> {
  return apiRequest<RatesResponse>("/api/exchange-rates", {
    query: { pairs: pairs.join(",") },
  });
}
