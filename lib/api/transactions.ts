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
  /** Exchange rate applied (source per destination unit). */
  rate?: number;
  /** Fee charged in source currency. */
  fee?: number;
  createdAt: string;
  updatedAt?: string;
  counterparty?: string;
  /** Stellar memo attached to the on-chain operation. */
  memo?: string;
  description?: string;
  /** Stellar transaction hash (hex). */
  hash?: string;
  /** Human-readable reference ID (may differ from internal UUID). */
  referenceId?: string;
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
    rate: d.rate !== undefined ? num(d.rate) : undefined,
    fee: d.fee !== undefined ? num(d.fee) : undefined,
    createdAt: str(d.createdAt ?? d.timestamp, new Date().toISOString()),
    updatedAt: typeof d.updatedAt === "string" ? d.updatedAt : undefined,
    counterparty:
      typeof d.counterparty === "string" ? d.counterparty : undefined,
    memo: typeof d.memo === "string" ? d.memo : undefined,
    description: typeof d.description === "string" ? d.description : undefined,
    hash: typeof d.hash === "string" ? d.hash : undefined,
    referenceId: typeof d.referenceId === "string" ? d.referenceId : undefined,
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
      rate: 1550,
      fee: 0.5,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      description: "Convert USDC to NGN",
      referenceId: "REF-001",
    },
    {
      id: "tx-2",
      type: "deposit",
      status: "completed",
      sourceAmount: 250,
      sourceCurrency: "USDC",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      description: "Deposit via Stellar Horizon",
      hash: "abc123def456abc123def456abc123def456abc123def456abc123def456abc1",
      referenceId: "REF-002",
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
      fee: 100,
      referenceId: "REF-003",
    },
    {
      id: "tx-4",
      type: "convert",
      status: "completed",
      sourceAmount: 50,
      sourceCurrency: "EUR",
      destinationAmount: 54.5,
      destinationCurrency: "USDC",
      rate: 1.09,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      description: "Convert EUR to USDC",
      referenceId: "REF-004",
    },
    {
      id: "tx-5",
      type: "transfer",
      status: "pending",
      sourceAmount: 120,
      sourceCurrency: "XLM",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      counterparty: "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS",
      description: "Transfer to external wallet",
      memo: "payment-ref-42",
      referenceId: "REF-005",
    },
  ];

  return {
    transactions: fallbackList.slice(0, limit),
    total: fallbackList.length,
  };
}

/**
 * Fetch a single transaction by ID.
 *
 * Returns the transaction if found, or `null` if the server returns 404.
 * Throws for other errors.
 */
export async function fetchTransaction(
  id: string,
): Promise<Transaction | null> {
  try {
    const data = await apiRequest<unknown>(
      `/api/transactions/${encodeURIComponent(id)}`,
    );
    if (!data) return null;
    return normaliseTransaction(data);
  } catch (err) {
    // 404 — not found or forbidden
    if (
      err instanceof Error &&
      (err.message.includes("404") || err.message.includes("403"))
    ) {
      return null;
    }
    // Dev fallback: look up from mock list
    if (process.env.NODE_ENV !== "production") {
      const { transactions } = getFallbackTransactions(10);
      return transactions.find((tx) => tx.id === id) ?? null;
    }
    throw err;
  }
}
