// Transaction types and API functions

export interface Transaction {
  id: string;
  date: string;
  type: 'Deposit' | 'Withdraw' | 'Transfer' | 'Exchange';
  currency: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed' | 'Cancelled';
  reference: string;
  description?: string;
}

export interface TransactionQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  from?: string;  // Date range start (ISO date string)
  to?: string;    // Date range end (ISO date string)
}

export interface TransactionResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
}

// Mock data for development
const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2026-03-20T10:30:00Z',
    type: 'Deposit',
    currency: 'USD',
    amount: 1000,
    status: 'Completed',
    reference: 'DEP-001',
    description: 'Bank transfer deposit'
  },
  {
    id: '2',
    date: '2026-03-19T14:15:00Z',
    type: 'Withdraw',
    currency: 'USD',
    amount: 500,
    status: 'Pending',
    reference: 'WTH-002',
    description: 'Withdrawal to bank account'
  },
  {
    id: '3',
    date: '2026-03-18T09:45:00Z',
    type: 'Exchange',
    currency: 'EUR',
    amount: 750,
    status: 'Completed',
    reference: 'EXC-003',
    description: 'USD to EUR exchange'
  },
  {
    id: '4',
    date: '2026-03-17T16:20:00Z',
    type: 'Transfer',
    currency: 'USD',
    amount: 200,
    status: 'Completed',
    reference: 'TRF-004',
    description: 'Internal transfer'
  },
  {
    id: '5',
    date: '2026-03-16T11:10:00Z',
    type: 'Deposit',
    currency: 'GBP',
    amount: 800,
    status: 'Failed',
    reference: 'DEP-005',
    description: 'Card deposit failed'
  },
  {
    id: '6',
    date: '2026-03-15T13:25:00Z',
    type: 'Withdraw',
    currency: 'USD',
    amount: 300,
    status: 'Completed',
    reference: 'WTH-006',
    description: 'ATM withdrawal'
  },
  {
    id: '7',
    date: '2026-03-14T08:40:00Z',
    type: 'Deposit',
    currency: 'USD',
    amount: 1500,
    status: 'Completed',
    reference: 'DEP-007',
    description: 'Wire transfer deposit'
  },
  {
    id: '8',
    date: '2026-03-13T17:55:00Z',
    type: 'Exchange',
    currency: 'JPY',
    amount: 50000,
    status: 'Completed',
    reference: 'EXC-008',
    description: 'USD to JPY exchange'
  },
  {
    id: '9',
    date: '2026-03-12T12:10:00Z',
    type: 'Transfer',
    currency: 'USD',
    amount: 100,
    status: 'Cancelled',
    reference: 'TRF-009',
    description: 'Cancelled transfer'
  },
  {
    id: '10',
    date: '2026-03-11T15:30:00Z',
    type: 'Deposit',
    currency: 'EUR',
    amount: 900,
    status: 'Completed',
    reference: 'DEP-010',
    description: 'SEPA transfer deposit'
  },
  {
    id: '11',
    date: '2026-02-28T10:30:00Z',
    type: 'Deposit',
    currency: 'USD',
    amount: 2000,
    status: 'Completed',
    reference: 'DEP-011',
    description: 'February deposit'
  },
  {
    id: '12',
    date: '2026-02-15T14:15:00Z',
    type: 'Withdraw',
    currency: 'USD',
    amount: 750,
    status: 'Completed',
    reference: 'WTH-012',
    description: 'February withdrawal'
  },
  {
    id: '13',
    date: '2026-01-30T09:45:00Z',
    type: 'Exchange',
    currency: 'EUR',
    amount: 1200,
    status: 'Completed',
    reference: 'EXC-013',
    description: 'January exchange'
  },
  {
    id: '14',
    date: '2026-01-15T16:20:00Z',
    type: 'Transfer',
    currency: 'USD',
    amount: 400,
    status: 'Completed',
    reference: 'TRF-014',
    description: 'January transfer'
  }
];

export async function getTransactions(query: TransactionQueryDto): Promise<TransactionResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredTransactions = [...mockTransactions];
  
  // Filter by search query
  if (query.search) {
    const searchLower = query.search.toLowerCase();
    filteredTransactions = filteredTransactions.filter(tx => 
      tx.reference.toLowerCase().includes(searchLower) ||
      tx.description?.toLowerCase().includes(searchLower) ||
      tx.currency.toLowerCase().includes(searchLower)
    );
  }
  
  // Filter by type
  if (query.type) {
    filteredTransactions = filteredTransactions.filter(tx => tx.type === query.type);
  }
  
  // Filter by date range
  if (query.from || query.to) {
    filteredTransactions = filteredTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      
      // Convert input dates to proper Date objects
      const fromDate = query.from ? new Date(query.from + 'T00:00:00Z') : null;
      const toDate = query.to ? new Date(query.to + 'T23:59:59Z') : null;
      
      if (fromDate && txDate < fromDate) {
        return false;
      }
      if (toDate && txDate > toDate) {
        return false;
      }
      return true;
    });
  }
  
  // Pagination
  const page = query.page || 1;
  const limit = query.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
  
  return {
    data: paginatedTransactions,
    total: filteredTransactions.length,
    page,
    limit
  };
}