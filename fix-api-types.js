const fs = require('fs');

// wallet.ts
let w = fs.readFileSync('lib/api/wallet.ts', 'utf8');
w = w.replace('export async function getBalances(): Promise<WalletBalance[]> {', 
`interface WalletBalancesResponse {
  data?: WalletBalance[];
  balances?: WalletBalance[];
}

export async function getBalances(): Promise<WalletBalance[]> {`);
w = w.replace(/apiClient<Record<string, unknown>>/g, 'apiClient<WalletBalancesResponse | WalletBalance[]>');
w = w.replace(/return Array.isArray\(data\).*/, 'return (Array.isArray(data) ? data : (data.data ?? data.balances ?? [])) as WalletBalance[];');
fs.writeFileSync('lib/api/wallet.ts', w);

// currencies.ts
let c = fs.readFileSync('lib/api/currencies.ts', 'utf8');
c = c.replace('export async function getCurrencies(): Promise<Currency[]> {',
`interface CurrenciesResponse {
  data?: Currency[];
  currencies?: Currency[];
}

export async function getCurrencies(): Promise<Currency[]> {`);
c = c.replace(/apiClient<Record<string, unknown>>/g, 'apiClient<CurrenciesResponse | Currency[]>');
c = c.replace(/return Array.isArray\(data\).*/, 'return (Array.isArray(data) ? data : (data.data ?? data.currencies ?? [])) as Currency[];');
fs.writeFileSync('lib/api/currencies.ts', c);

// notifications.ts
let n = fs.readFileSync('lib/api/notifications.ts', 'utf8');
n = n.replace('export async function getNotifications(',
`interface NotificationsResponse {
  data?: Notification[];
  notifications?: Notification[];
}

interface UnreadCountResponse {
  count?: number;
  unreadCount?: number;
}

export async function getNotifications(`);
n = n.replace(/apiClient<Record<string, unknown>>\("\/notifications"/g, 'apiClient<NotificationsResponse | Notification[]>("/notifications"');
n = n.replace(/apiClient<Record<string, unknown>>\("\/notifications\/unread-count"/g, 'apiClient<UnreadCountResponse>("/notifications/unread-count"');
n = n.replace(/return Array.isArray\(data\).*/, 'return (Array.isArray(data) ? data : (data.data ?? data.notifications ?? [])) as Notification[];');
n = n.replace(/return data.count \?\? data.unreadCount \?\? 0;/, 'return (data as UnreadCountResponse).count ?? (data as UnreadCountResponse).unreadCount ?? 0;');
fs.writeFileSync('lib/api/notifications.ts', n);

// transactions.ts
let t = fs.readFileSync('lib/api/transactions.ts', 'utf8');
t = t.replace(/Record<string, unknown>/g, 'Record<string, string | number | boolean | null | undefined | object>');
fs.writeFileSync('lib/api/transactions.ts', t);
