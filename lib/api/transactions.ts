import { apiClient } from "../api-client";
import { pickField } from "./pick-field";
import { formatDateTimeGB } from "../utils/format";

export type TransactionStatus = "Success" | "Pending" | "Failed";
export type TransactionType = "Deposit" | "Withdraw" | "Convert";

export interface TransactionFilters {
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  currency: string;
  toCurrency?: string;
  amount: number;
  amountString: string;
  date: string;
  rawDate?: string;
  status: TransactionStatus;
  reference: string;
  description?: string;
  fee?: number;
  exchangeRate?: number;
  toAmount?: number;
  walletAddress?: string;
}

export interface TransactionQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  from?: string;
  to?: string;
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapTransaction(dto: Record<string, any>): Transaction {
  const typeMap: Record<string, TransactionType> = {
    deposit: "Deposit",
    withdrawal: "Withdraw",
    withdraw: "Withdraw",
    convert: "Convert",
    conversion: "Convert",
    exchange: "Convert",
  };
  const statusMap: Record<string, TransactionStatus> = {
    success: "Success",
    pending: "Pending",
    failed: "Failed",
  };

  const type =
    typeMap[(dto.type as string)?.toLowerCase()] ??
    (dto.type as TransactionType);
  const status =
    statusMap[(dto.status as string)?.toLowerCase()] ??
    (dto.status as TransactionStatus);

  const currency = (dto.currency as string) ?? "";
  const amount = Number(dto.amount) || 0;

  let amountString = `${amount.toLocaleString()} ${currency}`;
  if (type === "Deposit") amountString = `+ ${amountString}`;
  else if (type === "Withdraw") amountString = `- ${amountString}`;

  const rawDate = (pickField(dto, "createdAt", "date", "created_at") ??
    "") as string;
  const date = rawDate
    ? new Date(rawDate).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const rawDate = (dto.createdAt ?? dto.date ?? dto.created_at) as string;
  const date = rawDate ? formatDateTimeGB(rawDate) : "";

  return {
    id: pickField(dto, "id", "_id") as string,
    type,
    currency,
    toCurrency: pickField(dto, "toCurrency", "to_currency") as
      string | undefined,
    amount,
    amountString,
    date,
    // Display "date" is locale-formatted (DD/MM/YYYY) and isn't safely
    // re-parseable for sorting — keep the original ISO-ish value around
    // for that purpose.
    rawDate: rawDate ?? "",
    status,
    reference: (pickField(
      dto,
      "reference",
      "transactionRef",
      "transaction_ref",
    ) ?? "") as string,
    description: dto.description as string | undefined,
    fee: dto.fee as number | undefined,
    exchangeRate: pickField(dto, "exchangeRate", "exchange_rate") as
      number | undefined,
    toAmount: pickField(dto, "toAmount", "to_amount") as number | undefined,
    walletAddress: pickField(
      dto,
      "walletAddress",
      "wallet_address",
      "address",
    ) as string | undefined,
  };
}

export async function getTransactions(
  query: TransactionQueryDto & TransactionFilters = {},
  fetchOptions?: { signal?: AbortSignal },
): Promise<PaginatedTransactions> {
  const params: Record<string, string> = {};
  if (query.page) params.page = String(query.page);
  if (query.limit) params.limit = String(query.limit);
  if (query.search) params.search = query.search;

  const typeValue = query.type && query.type !== "All" ? query.type : undefined;
  if (typeValue) {
    const typeParam =
      typeValue === "Withdraw" ? "withdrawal" : typeValue.toLowerCase();
    params.type = typeParam;
  }

  const statusValue =
    query.status && query.status !== "All" ? query.status : undefined;
  if (statusValue) {
    params.status = statusValue.toLowerCase();
  }

  const from = query.from || query.startDate;
  if (from) params.from = from;

  const to = query.to || query.endDate;
  if (to) params.to = to;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await apiClient<any>("/transactions", {
    params,
    signal: fetchOptions?.signal,
  });

  let dataList: Array<Record<string, unknown>> = [];
  let total = 0;
  let page = query.page ?? 1;
  let limit = query.limit ?? 20;

  if (Array.isArray(json)) {
    dataList = json;
    total = json.length;
  } else {
    dataList = (json.data ?? json.transactions ?? json.items ?? []) as Array<
      Record<string, unknown>
    >;
    total = (json.total ??
      json.totalCount ??
      json.count ??
      dataList.length) as number;
    page = (json.page ?? query.page ?? 1) as number;
    limit = (json.limit ?? query.limit ?? 20) as number;
  }

  const totalPages = Math.ceil(total / limit);

  return {
    data: dataList.map(mapTransaction),
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getTransactionById(id: string): Promise<Transaction> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await apiClient<any>(`/transactions/${id}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dto = (json.data ?? json) as Record<string, any>;
  return mapTransaction(dto);
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
  const convertTxs = transactions.filter((t) => t.type === "Convert");
  const grouped: Record<string, ConversionSummary> = {};

  convertTxs.forEach((tx) => {
    const date = new Date(tx.date);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const key = `${period}-${tx.currency}-${tx.toCurrency || ""}`;

    if (!grouped[key]) {
      grouped[key] = {
        period,
        fromCurrency: tx.currency,
        toCurrency: tx.toCurrency || "",
        totalAmount: 0,
        transactionCount: 0,
      };
    }
    grouped[key].totalAmount += tx.amount;
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
): Promise<WithdrawalResponse> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await apiClient<any>("/transactions/withdraw", {
    method: "POST",
    body: JSON.stringify(data),
  });

  // Normalize response - backend may use different field names
  const transactionId = pickField(
    json,
    "transactionId",
    "transaction_id",
    "id",
    "data.id",
    "data.transactionId",
  ) as string;

  const status = (pickField(json, "status", "data.status") ?? "pending") as
    "pending" | "success" | "failed";

  return {
    transactionId,
    status,
    message: json.message as string | undefined,
  };
}

// ==================== Deposit ====================
//
// Confirmed via live probe: POST /v1/transactions/deposit returns 401 (requires auth).
// The backend could not be tested with a valid token (auth endpoints returning 500).
//
// Required fields (based on audit + Stellar convention):
//   amount        — deposit amount as string
//   currency      — currency code (e.g. "USDC")
//   sourceAddress — the user's Stellar wallet public key; enables the backend to match
//                   incoming on-chain transactions to this user's account.
//                   Added as optional pending live verification.
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await apiClient<any>("/transactions/deposit", {
    method: "POST",
    body: JSON.stringify(body),
  });

  // Normalize response - backend may use different field names
  const transactionId = pickField(
    json,
    "transactionId",
    "transaction_id",
    "id",
    "data.id",
    "data.transactionId",
  ) as string;

  const status = (pickField(json, "status", "data.status") ?? "pending") as
    "pending" | "success" | "failed";

  return {
    transactionId,
    status,
    walletAddress: pickField(
      json,
      "walletAddress",
      "wallet_address",
      "address",
    ) as string | undefined,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await apiClient<any>("/transactions/swap", {
    method: "POST",
    body: JSON.stringify(data),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dto = (json.data ?? json) as Record<string, any>;
  return mapTransaction(dto);
}
