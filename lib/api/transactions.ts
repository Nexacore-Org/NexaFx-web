import { apiRequest } from "../api-client";

/**
 * NOTE: The backend transactions contract is NOT confirmed. The app has no reachable
 * backend, so the shapes below are documented assumptions kept in this module.
 * Every field is normalised at the read boundary with `??`, so a partial response
 * renders safely rather than crashing.
 */

export type TransactionType = "convert" | "deposit" | "withdraw" | "transfer";
export type TransactionStatus = "completed" | "pending" | "failed";

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  sourceAmount: number;
  sourceCurrency: string;
  destinationAmount?: number;
  destinationCurrency?: string;
  createdAt: string;
  counterparty?: string;
  description?: string;
  hash?: string;
}

export interface TransactionsQuery {
  limit?: number;
  cursor?: string;
  type?: TransactionType;
  status?: TransactionStatus;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  nextCursor?: string | null;
  total?: number;
}

function num(val: unknown, fallback = 0): number {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string") {
    const parsed = parseFloat(val);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function str(val: unknown, fallback = ""): string {
  return typeof val === "string" ? val : fallback;
}

export function normaliseTransaction(raw: unknown): Transaction {
  if (!raw || typeof raw !== "object") {
    return {
      id: "unknown",
      type: "convert",
      status: "completed",
      sourceAmount: 0,
      sourceCurrency: "USD",
      createdAt: new Date().toISOString(),
    };
  }

  const d = raw as Record<string, unknown>;
  const rawType = str(d.type).toLowerCase();
  const type: TransactionType = [
    "convert",
    "deposit",
    "withdraw",
    "transfer",
  ].includes(rawType)
    ? (rawType as TransactionType)
    : "convert";

  const rawStatus = str(d.status).toLowerCase();
  const status: TransactionStatus = ["completed", "pending", "failed"].includes(
    rawStatus,
  )
    ? (rawStatus as TransactionStatus)
    : "completed";

  const destAmt =
    d.destinationAmount !== undefined ? num(d.destinationAmount) : undefined;
  const destCurr =
    typeof d.destinationCurrency === "string"
      ? d.destinationCurrency
      : undefined;

  return {
    id: str(d.id, Math.random().toString(36).substring(2, 9)),
    type,
    status,
    sourceAmount: num(d.sourceAmount ?? d.amount),
    sourceCurrency: str(d.sourceCurrency ?? d.currency, "USD").toUpperCase(),
    destinationAmount: destAmt,
    destinationCurrency: destCurr ? destCurr.toUpperCase() : undefined,
    createdAt: str(d.createdAt ?? d.timestamp, new Date().toISOString()),
    counterparty:
      typeof d.counterparty === "string" ? d.counterparty : undefined,
    description: typeof d.description === "string" ? d.description : undefined,
    hash: typeof d.hash === "string" ? d.hash : undefined,
  };
}

export async function fetchTransactions(
  query: TransactionsQuery = {},
): Promise<TransactionsResponse> {
  try {
    const queryParams: Record<string, string | number> = {};
    if (query.limit) queryParams.limit = query.limit;
    if (query.cursor) queryParams.cursor = query.cursor;
    if (query.type) queryParams.type = query.type;
    if (query.status) queryParams.status = query.status;

    const data = await apiRequest<unknown>("/api/transactions", {
      query: queryParams,
    });

    if (!data || typeof data !== "object") {
      return { transactions: [] };
    }

    const res = data as Record<string, unknown>;
    const rawList = Array.isArray(res.transactions)
      ? res.transactions
      : Array.isArray(data)
        ? data
        : [];

    return {
      transactions: rawList.map(normaliseTransaction),
      nextCursor: typeof res.nextCursor === "string" ? res.nextCursor : null,
      total: typeof res.total === "number" ? res.total : rawList.length,
    };
  } catch (err) {
    // If backend is unreachable, gracefully return mock recent transactions for development if empty
    if (process.env.NODE_ENV !== "production") {
      return getFallbackTransactions(query.limit ?? 5);
    }
    throw err;
  }
}

function getFallbackTransactions(limit: number): TransactionsResponse {
  const fallbackList: Transaction[] = [
    {
      id: "tx-1",
      type: "convert",
      status: "completed",
      sourceAmount: 100,
      sourceCurrency: "USDC",
      destinationAmount: 155000,
      destinationCurrency: "NGN",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      description: "Convert USDC to NGN",
    },
    {
      id: "tx-2",
      type: "deposit",
      status: "completed",
      sourceAmount: 250,
      sourceCurrency: "USDC",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      description: "Deposit via Stellar Horizon",
    },
    {
      id: "tx-3",
      type: "withdraw",
      status: "completed",
      sourceAmount: 50000,
      sourceCurrency: "NGN",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      counterparty: "Access Bank ****1234",
      description: "Bank transfer payout",
    },
    {
      id: "tx-4",
      type: "convert",
      status: "completed",
      sourceAmount: 50,
      sourceCurrency: "EUR",
      destinationAmount: 54.5,
      destinationCurrency: "USDC",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      description: "Convert EUR to USDC",
    },
    {
      id: "tx-5",
      type: "transfer",
      status: "pending",
      sourceAmount: 120,
      sourceCurrency: "XLM",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      counterparty: "GAB7...K992",
      description: "Transfer to external wallet",
    },
  ];

  return {
    transactions: fallbackList.slice(0, limit),
    total: fallbackList.length,
  };
}
