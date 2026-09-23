#!/usr/bin/env node
/*
 * Mock backend for local frontend development.
 *
 * Lets contributors develop and test the NexaFX frontend end-to-end without
 * needing credentials or network access to the real backend.
 *
 * Usage:
 *   node mock-backend/server.mjs            # serves on http://localhost:3001
 *   PORT=4000 node mock-backend/server.mjs  # custom port
 *
 * Then point the frontend at it in your local `.env`:
 *   NEXT_PUBLIC_API_URL=http://localhost:3001
 *
 * See docs/local-setup.md for the full guide.
 */
import { createServer } from "node:http";

const PORT = Number(process.env.PORT || 3001);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-token",
};

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    ...CORS_HEADERS,
  });
  res.end(payload);
}

// Deterministic fake exchange rate so the dashboard and convert form work.
function rateFor(from, to) {
  const base = {
    NGN: 1,
    USD: 1550,
    EUR: 1660,
    GBP: 1920,
    USDC: 1548,
    ETH: 5200000,
    BTC: 98000000,
  };
  const fromRate = base[String(from).toUpperCase()] ?? 1000;
  const toRate = base[String(to).toUpperCase()] ?? 1000;
  return Number((fromRate / toRate).toFixed(4));
}

const SAMPLE_USER = {
  id: "user_001",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  role: "USER",
};

const SAMPLE_ADMIN = {
  id: "admin_001",
  firstName: "Admin",
  lastName: "User",
  email: "admin@example.com",
  role: "ADMIN",
};

const SAMPLE_TRANSACTIONS = [
  {
    id: "txn_001",
    type: "deposit",
    currency: "USDC",
    amount: 1500,
    status: "success",
    reference: "DEP-20250101-0001",
    createdAt: new Date().toISOString(),
  },
  {
    id: "txn_002",
    type: "withdrawal",
    currency: "USDC",
    amount: 250,
    status: "pending",
    reference: "WDR-20250102-0002",
    createdAt: new Date().toISOString(),
  },
  {
    id: "txn_003",
    type: "conversion",
    currency: "NGN",
    toCurrency: "USD",
    amount: 50000,
    status: "success",
    reference: "CVT-20250103-0003",
    createdAt: new Date().toISOString(),
  },
];

const SAMPLE_TRANSACTIONS_ADMIN = SAMPLE_TRANSACTIONS.map((t) => ({
  ...t,
  username: "ada.lovelace",
}));

const SAMPLE_NOTIFICATIONS = [
  {
    id: "notif_001",
    type: "deposit",
    title: "Deposit received",
    message: "Your deposit of 1,500 USDC was received.",
    timestamp: new Date().toISOString(),
    isRead: false,
  },
  {
    id: "notif_002",
    type: "system",
    title: "Welcome",
    message: "Welcome to NexaFX.",
    timestamp: new Date().toISOString(),
    isRead: true,
  },
];

const SAMPLE_ADMIN_USERS = [
  {
    id: "user_001",
    email: "ada@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
    walletAddress: "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
    username: "ada.lovelace",
    transactions: 12,
    totalDeposit: 45000,
    totalWithdraw: 1200,
    kycStatus: "Verified",
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];

const SAMPLE_ADMIN_METRICS = {
  registeredUsers: 128,
  totalTransactions: 1024,
  pendingKyc: 6,
  currencies: 8,
  totalDeposits: 1840000,
  totalWithdrawals: 620000,
};

const SAMPLE_PUSH_NOTIFICATIONS = [
  {
    id: "push_001",
    title: "Scheduled maintenance",
    message: "NexaFX will be down for maintenance on Sunday 2am WAT.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

function authSuccessPayload(overrides = {}) {
  return {
    user: { ...SAMPLE_USER, ...overrides.user },
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
  };
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  const method = req.method.toUpperCase();

  if (method === "OPTIONS") {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  // ---- Exchange rates (hit by app/api/exchange-rates and the dashboard) ----
  if (method === "GET" && path === "/exchange-rates") {
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    if (!from || !to) {
      json(res, 400, { error: 'Missing "from" or "to" query parameters' });
      return;
    }
    json(res, 200, { from, to, rate: rateFor(from, to), change: "0.5" });
    return;
  }

  // ---- Auth ----
  if (method === "POST" && path === "/auth/login") {
    json(res, 200, { message: "OTP sent to your email" });
    return;
  }
  if (method === "POST" && path === "/auth/verify-login-otp") {
    json(res, 200, authSuccessPayload({ user: SAMPLE_USER }));
    return;
  }
  if (method === "POST" && path === "/auth/signup") {
    json(res, 200, { message: "OTP sent to your email" });
    return;
  }
  if (method === "POST" && path === "/auth/verify-signup-otp") {
    json(res, 200, { message: "Verified" });
    return;
  }
  if (method === "POST" && path === "/auth/resend-signup-otp") {
    json(res, 200, { message: "OTP resent" });
    return;
  }
  if (method === "POST" && path === "/auth/resend-login-otp") {
    json(res, 200, { message: "OTP resent" });
    return;
  }
  if (method === "POST" && path === "/auth/forgot-password") {
    json(res, 200, { message: "Reset code sent to your email" });
    return;
  }
  if (method === "POST" && path === "/auth/reset-password") {
    json(res, 200, { message: "Password reset successfully" });
    return;
  }
  if (method === "POST" && path === "/auth/refresh") {
    json(res, 200, {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    });
    return;
  }

  // ---- Transactions ----
  if (method === "GET" && path === "/transactions") {
    json(res, 200, {
      data: SAMPLE_TRANSACTIONS,
      total: SAMPLE_TRANSACTIONS.length,
      page: 1,
      limit: 10,
    });
    return;
  }
  if (method === "GET" && path.startsWith("/transactions/")) {
    const id = path.split("/").pop();
    json(res, 200, {
      data: SAMPLE_TRANSACTIONS.find((t) => t.id === id) ?? SAMPLE_TRANSACTIONS[0],
    });
    return;
  }
  if (method === "POST" && path === "/transactions/withdraw") {
    json(res, 200, { transactionId: "txn_w002", status: "pending", message: "Withdrawal submitted" });
    return;
  }
  if (method === "POST" && path === "/transactions/deposit") {
    json(res, 200, {
      transactionId: "txn_d002",
      status: "pending",
      walletAddress: "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      message: "Deposit submitted",
    });
    return;
  }
  if (method === "POST" && path === "/transactions/swap") {
    json(res, 200, {
      transactionId: "txn_s002",
      status: "pending",
      toAmount: 50,
      exchangeRate: 0.000645,
      message: "Conversion submitted",
    });
    return;
  }

  // ---- Wallet ----
  if (method === "GET" && path === "/users/wallet/balances") {
    json(res, 200, {
      data: [
        { currency: "NGN", balance: "750000.00" },
        { currency: "USD", balance: "120.00" },
        { currency: "USDC", balance: "3000.00" },
      ],
    });
    return;
  }

  // ---- Notifications ----
  if (method === "GET" && path === "/notifications") {
    json(res, 200, { data: SAMPLE_NOTIFICATIONS });
    return;
  }
  if (method === "GET" && path === "/notifications/unread-count") {
    json(res, 200, { count: SAMPLE_NOTIFICATIONS.filter((n) => !n.isRead).length });
    return;
  }
  if (method === "PATCH" && path === "/notifications/batch/mark-all-read") {
    json(res, 200, {});
    return;
  }
  if (method === "PATCH" && /^\/notifications\/[^/]+\/read$/.test(path)) {
    json(res, 200, {});
    return;
  }
  if (method === "DELETE" && path.startsWith("/notifications/")) {
    json(res, 200, {});
    return;
  }

  // ---- Admin ----
  if (method === "GET" && path === "/admin/metrics") {
    json(res, 200, { data: SAMPLE_ADMIN_METRICS });
    return;
  }
  if (method === "GET" && path === "/admin/users") {
    json(res, 200, { data: SAMPLE_ADMIN_USERS });
    return;
  }
  if (method === "GET" && path.startsWith("/admin/users/")) {
    json(res, 200, { data: SAMPLE_ADMIN_USERS[0] });
    return;
  }
  if (method === "GET" && path === "/admin/transactions") {
    json(res, 200, { data: SAMPLE_TRANSACTIONS_ADMIN });
    return;
  }
  if (method === "GET" && path === "/admin/push-notifications") {
    json(res, 200, { data: SAMPLE_PUSH_NOTIFICATIONS });
    return;
  }
  if (method === "POST" && path === "/admin/push-notifications") {
    const body = await readBody(req);
    json(res, 200, {
      data: {
        id: "push_002",
        title: body.title ?? "Untitled",
        message: body.message ?? "",
        status: "Active",
        createdAt: new Date().toISOString(),
      },
    });
    return;
  }

  // ---- User profile ----
  if (method === "GET" && path === "/users/me") {
    json(res, 200, {
      data: { ...SAMPLE_USER, walletAddress: "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890" },
    });
    return;
  }

  // ---- Fallback ----
  json(res, 404, { message: `No mock route for ${method} ${path}` });
});

server.listen(PORT, () => {
  console.log(`NexaFX mock backend listening on http://localhost:${PORT}`);
});