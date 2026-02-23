export type TransactionStatus = "Success" | "Pending" | "Failed";
export type TransactionType = "Deposit" | "Withdraw" | "Convert";

export interface Transaction {
    id: string;
    type: TransactionType;
    currency: string;
    toCurrency?: string;
    amount: number;
    amountString: string;
    date: string;
    status: TransactionStatus;
    reference: string;
    description?: string;
    fee?: number;
    exchangeRate?: number;
    toAmount?: number;
}

export interface TransactionQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
}

export interface PaginatedTransactions {
    data: Transaction[];
    total: number;
    page: number;
    limit: number;
}

// All requests go through the local Next.js proxy to avoid CORS and inject auth server-side.
// Once a real login flow exists, the proxy will forward the client's token automatically.
const BASE_URL = "/api/proxy";

function getAuthHeaders(): HeadersInit {
    const token =
        typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    return {
        "Content-Type": "application/json",
        // Forward the client token to the proxy via a custom header so it takes priority
        // over the dev fallback token in .env.local
        ...(token ? { "x-client-token": token } : {}),
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTransaction(dto: Record<string, any>): Transaction {
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
        typeMap[(dto.type as string)?.toLowerCase()] ?? (dto.type as TransactionType);
    const status =
        statusMap[(dto.status as string)?.toLowerCase()] ?? (dto.status as TransactionStatus);

    const amount = Number(dto.amount) || 0;
    const currency = (dto.currency as string) ?? "";

    let amountString = `${amount.toLocaleString()} ${currency}`;
    if (type === "Deposit") amountString = `+ ${amountString}`;
    else if (type === "Withdraw") amountString = `- ${amountString}`;

    const rawDate = (dto.createdAt ?? dto.date ?? dto.created_at) as string;
    const date = rawDate
        ? new Date(rawDate).toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : "";

    return {
        id: (dto.id ?? dto._id) as string,
        type,
        currency,
        toCurrency: (dto.toCurrency ?? dto.to_currency) as string | undefined,
        amount,
        amountString,
        date,
        status,
        reference: (dto.reference ?? dto.transactionRef ?? dto.transaction_ref ?? "") as string,
        description: dto.description as string | undefined,
        fee: dto.fee as number | undefined,
        exchangeRate: (dto.exchangeRate ?? dto.exchange_rate) as number | undefined,
        toAmount: (dto.toAmount ?? dto.to_amount) as number | undefined,
    };
}

export async function getTransactions(
    query: TransactionQueryDto = {}
): Promise<PaginatedTransactions> {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.search) params.set("search", query.search);
    if (query.type && query.type !== "All") {
        const typeParam =
            query.type === "Withdraw" ? "withdrawal" : query.type.toLowerCase();
        params.set("type", typeParam);
    }

    const res = await fetch(`${BASE_URL}/transactions?${params.toString()}`, {
        headers: getAuthHeaders(),
    });

    if (!res.ok) throw new Error(`Failed to fetch transactions: ${res.status}`);

    const json = await res.json();

    if (Array.isArray(json)) {
        return {
            data: json.map(mapTransaction),
            total: json.length,
            page: query.page ?? 1,
            limit: query.limit ?? 10,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (json.data ?? json.transactions ?? json.items ?? []) as Record<string, any>[];
    const total = (json.total ?? json.totalCount ?? json.count ?? data.length) as number;

    return {
        data: data.map(mapTransaction),
        total,
        page: json.page ?? query.page ?? 1,
        limit: json.limit ?? query.limit ?? 10,
    };
}

export async function getTransactionById(id: string): Promise<Transaction> {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
        headers: getAuthHeaders(),
    });

    if (!res.ok) throw new Error(`Failed to fetch transaction: ${res.status}`);

    const json = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dto = (json.data ?? json) as Record<string, any>;
    return mapTransaction(dto);
}

// ==================== Withdrawal ====================

export interface CreateWithdrawalDto {
    currency: string;
    amount: string;
    walletAddress: string;
}

export interface WithdrawalResponse {
    transactionId: string;
    status: "pending" | "success" | "failed";
    message?: string;
}

export async function createWithdrawal(
    data: CreateWithdrawalDto
): Promise<WithdrawalResponse> {
    const res = await fetch(`${BASE_URL}/transactions/withdraw`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
        const errorMessage =
            json.message ?? json.error ?? `Withdrawal failed: ${res.status}`;
        throw new Error(errorMessage);
    }

    // Normalize response - backend may use different field names
    const transactionId = (json.transactionId ??
        json.transaction_id ??
        json.id ??
        json.data?.id ??
        json.data?.transactionId) as string;

    const status = (json.status ?? json.data?.status ?? "pending") as
        | "pending"
        | "success"
        | "failed";

    return {
        transactionId,
        status,
        message: json.message,
    };
}

// ==================== Deposit ====================

export interface CreateDepositDto {
    amount: string;
    currency: string;
}

export interface DepositResponse {
    transactionId: string;
    status: "pending" | "success" | "failed";
    walletAddress?: string;
    message?: string;
}

export async function createDeposit(
    data: CreateDepositDto
): Promise<DepositResponse> {
    const res = await fetch(`${BASE_URL}/transactions/deposit`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
        const errorMessage =
            json.message ?? json.error ?? `Deposit failed: ${res.status}`;
        throw new Error(errorMessage);
    }

    // Normalize response - backend may use different field names
    const transactionId = (json.transactionId ??
        json.transaction_id ??
        json.id ??
        json.data?.id ??
        json.data?.transactionId) as string;

    const status = (json.status ?? json.data?.status ?? "pending") as
        | "pending"
        | "success"
        | "failed";

    return {
        transactionId,
        status,
        walletAddress: json.walletAddress ?? json.wallet_address ?? json.address,
        message: json.message,
    };
}
