import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

/**
 * Default ("happy path") handlers shared by every test. Individual tests
 * override these with `server.use(...)` to exercise loading / error / edge
 * cases. All wallet, profile and notification endpoints are called with
 * `useProxy: false`, so they hit the bare path (BASE_URL is "" under test);
 * the swap endpoint goes through the proxy at /api/proxy/transactions/swap.
 * Leading `*` lets each handler match regardless of origin.
 */
export const handlers = [
  http.get("*/users/profile", () =>
    HttpResponse.json({
      id: "user-1",
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    })
  ),

  http.get("*/users/wallet/balances", () =>
    HttpResponse.json([
      { currency: "NGN", amount: 15000000, balance: "15,000,000.00" },
      { currency: "USD", amount: 2500.5, balance: "2,500.50" },
    ])
  ),

  http.get("*/notifications/unread-count", () =>
    HttpResponse.json({ count: 0 })
  ),

  http.get("*/notifications", () => HttpResponse.json({ data: [] })),

  http.get("*/api/exchange-rates", () => HttpResponse.json({ rate: 1500 })),

  http.post("*/transactions/swap", () =>
    HttpResponse.json({
      transactionId: "tx-swap-1",
      status: "success",
      toAmount: 150000,
      exchangeRate: 1500,
    })
  ),
];

export const server = setupServer(...handlers);
