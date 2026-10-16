import { apiRequest } from "../api-client";

function toApiBase(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "/api";
  return `${base}${path}`;
}

export interface AdminTransaction {
  id: string;
  reference: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
  counterparty?: string | null;
}

export interface AdminTransactionsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  status?: string;
  from?: string;
  to?: string;
}

export interface AdminTransactionsResponse {
  transactions: AdminTransaction[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getAdminTransactions(
  query: AdminTransactionsQuery,
): Promise<AdminTransactionsResponse> {
  const data = await apiRequest<Partial<AdminTransactionsResponse>>(
    toApiBase("/admin/transactions"),
    {
      query: {
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 20,
        search: query.search ?? "",
        type: query.type ?? "",
        status: query.status ?? "",
        from: query.from ?? "",
        to: query.to ?? "",
      },
    },
  );
  return {
    transactions: (data.transactions ?? []).map((t) => ({
      id: t.id ?? "",
      reference: t.reference ?? "",
      type: t.type ?? "",
      amount: t.amount ?? "0",
      currency: t.currency ?? "",
      status: t.status ?? "",
      createdAt: t.createdAt ?? "",
      counterparty: t.counterparty ?? null,
    })),
    total: data.total ?? 0,
    page: data.page ?? 1,
    pageSize: data.pageSize ?? 20,
  };
}
