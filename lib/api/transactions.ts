import { apiClient } from '../api-client';

export type TransactionStatus = 'Success' | 'Pending' | 'Failed';
export type TransactionType = 'Deposit' | 'Withdraw' | 'Convert';

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
    status: TransactionStatus;
    reference: string;
    description?: string;
    fee?: number;
    exchangeRate?: number;
    toAmount?: number;
    walletAddress?: string;
    hasDispute?: boolean;
    disputeStatus?: string;
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
function mapTransaction(dto: Record<string, any>): Transaction {
    const typeMap: Record<string, TransactionType> = {
        deposit: 'Deposit',
        withdrawal: 'Withdraw',
        withdraw: 'Withdraw',
        convert: 'Convert',
        conversion: 'Convert',
        exchange: 'Convert',
    };
    const statusMap: Record<string, TransactionStatus> = {
        success: 'Success',
        pending: 'Pending',
        failed: 'Failed',
    };

    const type =
        typeMap[(dto.type as string)?.toLowerCase()] ?? (dto.type as TransactionType);
    const status =
        statusMap[(dto.status as string)?.toLowerCase()] ?? (dto.status as TransactionStatus);

    const amount = Number(dto.amount) || 0;
    const currency = (dto.currency as string) ?? '';

    let amountString = `${amount.toLocaleString()} ${currency}`;
    if (type === 'Deposit') amountString = `+ ${amountString}`;
    else if (type === 'Withdraw') amountString = `- ${amountString}`;

    const rawDate = (dto.createdAt ?? dto.date ?? dto.created_at) as string;
    const date = rawDate
        ? new Date(rawDate).toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : '';

    return {
        id: (dto.id ?? dto._id) as string,
        type,
        currency,
        toCurrency: (dto.toCurrency ?? dto.to_currency) as string | undefined,
        amount,
        amountString,
        date,
        status,
        reference: (dto.reference ?? dto.transactionRef ?? dto.transaction_ref ?? '') as string,
        description: dto.description as string | undefined,
        fee: dto.fee as number | undefined,
        exchangeRate: (dto.exchangeRate ?? dto.exchange_rate) as number | undefined,
        toAmount: (dto.toAmount ?? dto.to_amount) as number | undefined,
        walletAddress: (dto.walletAddress ?? dto.wallet_address ?? dto.address) as string | undefined,
        hasDispute: (dto.hasDispute ?? dto.has_dispute) as boolean | undefined,
        disputeStatus: (dto.disputeStatus ?? dto.dispute_status) as string | undefined,
    };
}

export async function getTransactions(
  query: TransactionQueryDto & TransactionFilters = {}
): Promise<PaginatedTransactions> {
  const params: Record<string, string> = {};
  if (query.page) params.page = String(query.page);
  if (query.limit) params.limit = String(query.limit);
  if (query.search) params.search = query.search;
  
  const typeValue = query.type && query.type !== "All" ? query.type : undefined;
  if (typeValue) {
    const typeParam = typeValue === "Withdraw" ? "withdrawal" : typeValue.toLowerCase();
    params.type = typeParam;
  }
  
  const statusValue = query.status && query.status !== "All" ? query.status : undefined;
  if (statusValue) {
    params.status = statusValue.toLowerCase();
  }

  const from = query.from || query.startDate;
  if (from) params.from = from;
  
  const to = query.to || query.endDate;
  if (to) params.to = to;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json = await apiClient<any>('/transactions', {
        params,
    });

  let dataList: any[] = [];
  let total = 0;
  let page = query.page ?? 1;
  let limit = query.limit ?? 20;

  if (Array.isArray(json)) {
    dataList = json;
    total = json.length;
  } else {
    dataList = (json.data ?? json.transactions ?? json.items ?? []) as Record<string, any>[];
    total = (json.total ?? json.totalCount ?? json.count ?? dataList.length) as number;
    page = (json.page ?? query.page ?? 1) as number;
    limit = (json.limit ?? query.limit ?? 20) as number;
  }

  const totalPages = Math.ceil(total / limit);

  return { 
    data: dataList.map(mapTransaction), 
    total, 
    page, 
    limit,
    totalPages
  };
}

export async function getTransactionById(id: string): Promise<Transaction> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await apiClient<any>(`/transactions/${id}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dto = (json.data ?? json) as Record<string, any>;
  return mapTransaction(dto);
}

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
    status: 'pending' | 'success' | 'failed';
    message?: string;
}

export async function createWithdrawal(
    data: CreateWithdrawalDto
): Promise<WithdrawalResponse> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json = await apiClient<any>('/transactions/withdraw', {
        method: 'POST',
        body: JSON.stringify(data),
    });

    // Normalize response - backend may use different field names
    const transactionId = (json.transactionId ??
        json.transaction_id ??
        json.id ??
        json.data?.id ??
        json.data?.transactionId) as string;

    const status = (json.status ?? json.data?.status ?? 'pending') as
        | 'pending'
        | 'success'
        | 'failed';

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
}

export interface DepositResponse {
    transactionId: string;
    status: 'pending' | 'success' | 'failed';
    walletAddress?: string;
    message?: string;
}

export async function createDeposit(
    data: CreateDepositDto
): Promise<DepositResponse> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json = await apiClient<any>('/transactions/deposit', {
        method: 'POST',
        body: JSON.stringify(data),
    });

    // Normalize response - backend may use different field names
    const transactionId = (json.transactionId ??
        json.transaction_id ??
        json.id ??
        json.data?.id ??
        json.data?.transactionId) as string;

    const status = (json.status ?? json.data?.status ?? 'pending') as
        | 'pending'
        | 'success'
        | 'failed';

    return {
        transactionId,
        status,
        walletAddress: (json.walletAddress ?? json.wallet_address ?? json.address) as string | undefined,
        message: json.message as string | undefined,
    };
}

// ==================== Swap ====================

export interface CreateSwapDto {
    fromCurrency: string;
    toCurrency: string;
    amount: string;
    lockId?: string;
}

export interface SwapResponse {
    transactionId: string;
    status: 'pending' | 'success' | 'failed';
    toAmount?: number;
    exchangeRate?: number;
    message?: string;
}

export async function createSwap(data: CreateSwapDto): Promise<SwapResponse> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json = await apiClient<any>('/transactions/swap', {
        method: 'POST',
        body: JSON.stringify(data),
    });

    const transactionId = (json.transactionId ??
        json.transaction_id ??
        json.id ??
        json.data?.id ??
        json.data?.transactionId) as string;

    const status = (json.status ?? json.data?.status ?? 'pending') as
        | 'pending'
        | 'success'
        | 'failed';

    return {
        transactionId,
        status,
        toAmount: json.toAmount ?? json.to_amount,
        exchangeRate: json.exchangeRate ?? json.exchange_rate,
        message: json.message as string | undefined,
    };
}

// ==================== Dispute ====================

export async function raiseDispute(transactionId: string, description: string): Promise<void> {
    await apiClient(`/transactions/${transactionId}/dispute`, {
        method: 'POST',
        body: JSON.stringify({ description }),
    });
}
