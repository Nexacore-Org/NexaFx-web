import { apiRequest } from "../api-client";
import { generateIdempotencyKey, idempotencyHeader } from "../idempotency";

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
  /** Zero-based page index for page-based pagination. */
  page?: number;
  cursor?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  currency?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  nextCursor?: string | null;
  total?: number;
  /** Total number of pages when using page-based pagination. */
  totalPages?: number;
  /** Current page (0-based). */
  page?: number;
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
    if (query.currency) queryParams.currency = query.currency;
    if (query.search) queryParams.search = query.search;
    if (query.dateFrom) queryParams.dateFrom = query.dateFrom;
    if (query.dateTo) queryParams.dateTo = query.dateTo;
    if (query.page !== undefined) queryParams.page = query.page;

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

    const total = typeof res.total === "number" ? res.total : rawList.length;
    const limit = query.limit ?? 10;

    return {
      transactions: rawList.map(normaliseTransaction),
      nextCursor: typeof res.nextCursor === "string" ? res.nextCursor : null,
      total,
      totalPages:
        typeof res.totalPages === "number"
          ? res.totalPages
          : Math.ceil(total / limit),
      page: query.page ?? 0,
    };
  } catch (err) {
    // If backend is unreachable, gracefully return mock recent transactions for development if empty
    if (process.env.NODE_ENV !== "production") {
      return getFallbackTransactions(query.limit ?? 5, query.page ?? 0);
    }
    throw err;
  }
}

function getFallbackTransactions(
  limit: number,
  page = 0,
): TransactionsResponse {
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

  const start = page * limit;
  const paged = fallbackList.slice(start, start + limit);

  return {
    transactions: paged,
    total: fallbackList.length,
    totalPages: Math.ceil(fallbackList.length / limit),
    page,
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

// ==================== Conversion Summary ====================

export interface ConversionSummary {
  period: string;
  fromCurrency: string;
  toCurrency: string;
  totalAmount: number;
  transactionCount: number;
}

export const getConversionSummary = (
  transactions: Transaction[],
): ConversionSummary[] => {
  const convertTxs = transactions.filter((t) => t.type === "convert");
  const grouped: Record<string, ConversionSummary> = {};

  convertTxs.forEach((tx) => {
    const date = new Date(tx.createdAt);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const key = `${period}-${tx.sourceCurrency}-${tx.destinationCurrency ?? ""}`;

    if (!grouped[key]) {
      grouped[key] = {
        period,
        fromCurrency: tx.sourceCurrency,
        toCurrency: tx.destinationCurrency ?? "",
        totalAmount: 0,
        transactionCount: 0,
      };
    }
    grouped[key].totalAmount += tx.sourceAmount;
    grouped[key].transactionCount += 1;
  });

  return Object.values(grouped).sort((a, b) =>
    a.period.localeCompare(b.period),
  );
};

// ==================== Withdrawal ====================

// Confirmed against backend src/transactions/dtos/transaction.dto.ts:
// - field is `destinationAddress` (not `walletAddress`)
// - `amount` must be a number, not a string
// - `beneficiaryId` and `walletId` are optional alternative targeting fields
export interface CreateWithdrawalDto {
  currency: string;
  amount: number;
  destinationAddress?: string;
  beneficiaryId?: string;
  walletId?: string;
}

export interface WithdrawalResponse {
  transactionId: string;
  status: "pending" | "success" | "failed";
  message?: string;
}

export async function createWithdrawal(
  data: CreateWithdrawalDto,
  idempotencyKey?: string,
): Promise<WithdrawalResponse> {
  const key = idempotencyKey ?? generateIdempotencyKey();

  // NOTE: The `Idempotency-Key` header is sent so that a future backend
  // update requires no frontend changes. Until the backend confirms it
  // honours this header for deduplication, the client-side `useSubmitOnce`
  // guard prevents duplicate in-flight requests.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await apiRequest<any>("/transactions/withdraw", {
    method: "POST",
    headers: idempotencyHeader(key),
    body: JSON.stringify(data),
  });

  // Normalize response - backend may use different field names
  const transactionId = (json.transactionId ??
    json.transaction_id ??
    json.id ??
    json.data?.id ??
    json.data?.transactionId) as string;

  const status = (json.status ?? json.data?.status ?? "pending") as
    "pending" | "success" | "failed";

  return {
    transactionId,
    status,
    message: json.message as string | undefined,
  };
}

// ==================== Deposit ====================

export interface CreateDepositDto {
  amount: string;
  currency: string;
  sourceAddress?: string;
}

export interface DepositResponse {
  transactionId: string;
  status: "pending" | "success" | "failed";
  walletAddress?: string;
  message?: string;
}

export async function createDeposit({
  amount,
  currency,
  sourceAddress,
}: CreateDepositDto): Promise<DepositResponse> {
  const body: Record<string, string> = { amount, currency };
  if (sourceAddress) body.sourceAddress = sourceAddress;

  const key = generateIdempotencyKey();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await apiRequest<any>("/transactions/deposit", {
    method: "POST",
    headers: idempotencyHeader(key),
    body: JSON.stringify(body),
  });

  // Normalize response - backend may use different field names
  const transactionId = (json.transactionId ??
    json.transaction_id ??
    json.id ??
    json.data?.id ??
    json.data?.transactionId) as string;

  const status = (json.status ?? json.data?.status ?? "pending") as
    "pending" | "success" | "failed";

  return {
    transactionId,
    status,
    walletAddress: json.walletAddress as string | undefined,
    message: json.message as string | undefined,
  };
}

// ==================== Swap ====================

export interface CreateSwapDto {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  lockId?: string;
}

export async function createSwap(data: CreateSwapDto): Promise<Transaction> {
  const key = generateIdempotencyKey();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await apiRequest<any>("/transactions/swap", {
    method: "POST",
    headers: idempotencyHeader(key),
    body: JSON.stringify(data),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dto = (json.data ?? json) as Record<string, any>;
  return normaliseTransaction(dto);
}
