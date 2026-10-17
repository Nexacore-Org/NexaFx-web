"use client";

import { useQuery } from "@tanstack/react-query";
import { getRates } from "@/lib/api/exchange-rates";
import { convertAmount } from "@/lib/convert-amount";
import { getCurrency } from "@/lib/currencies";
import { queryKeys } from "@/lib/query-keys";

/**
 * How long a quote is treated as valid on the client. The rates endpoint does
 * not return an expiry or a rate lock, so this is a UX window: after it, the
 * user is asked to refresh instead of confirming a stale price.
 */
export const QUOTE_TTL_MS = 30_000;

export interface ConvertQuoteParams {
  from: string;
  to: string;
  amount: string;
}

export interface ConvertQuote {
  quoteId: string;
  pair: string;
  /** Units of the destination currency per 1 unit of the source currency. */
  rate: string;
  /** Amount received, cut down to the destination currency's decimals. */
  toAmount: string;
  /** The rates endpoint returns no fee, so this stays null until it does. */
  fee: string | null;
  feeCurrency: string;
  /** ISO timestamp after which the quote should be refreshed. */
  expiresAt: string;
}

async function fetchConvertQuote({
  from,
  to,
  amount,
}: ConvertQuoteParams): Promise<ConvertQuote> {
  const fromCurrency = getCurrency(from);
  const toCurrency = getCurrency(to);
  if (!fromCurrency || !toCurrency) {
    throw new Error("Unsupported currency");
  }

  const pair = `${from}/${to}`;
  const { quotes } = await getRates([pair]);
  const match = quotes.find((quote) => quote.pair.toUpperCase() === pair);
  if (!match) throw new Error(`No rate available for ${pair}`);

  const toAmount = convertAmount(
    amount,
    match.rate,
    fromCurrency.decimals,
    toCurrency.decimals,
  );
  if (toAmount === null) throw new Error(`Rate for ${pair} is not usable`);

  return {
    quoteId: crypto.randomUUID(),
    pair,
    rate: String(match.rate),
    toAmount,
    fee: null,
    feeCurrency: from,
    expiresAt: new Date(Date.now() + QUOTE_TTL_MS).toISOString(),
  };
}

/**
 * Live quote for a pair and amount. Pass null to keep it idle. It never
 * refetches on its own (focus, reconnect), because a price must not change
 * under the user without them being asked: call `refetch` explicitly.
 */
export function useConvertQuote(params: ConvertQuoteParams | null) {
  return useQuery({
    queryKey: [
      ...queryKeys.rates(params ? `${params.from}/${params.to}` : "idle"),
      "quote",
      params?.amount ?? "",
    ],
    queryFn: () => fetchConvertQuote(params as ConvertQuoteParams),
    enabled: params !== null,
    staleTime: 0,
    gcTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
