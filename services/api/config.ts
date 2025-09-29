/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://nexafx-backend.onrender.com/api/v1/",
  TIMEOUT: 120000,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    CREATE: "/auth/initiate-signup",
    VERIFY: "/auth/verify-signup",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },

  // Transactions endpoints
  TRANSACTIONS: {
    ALL: "/transactions",
    CREATE: "/transactions",
    DELETE: (id: string) => `/transactions/${id}`,
    GET: (id: string) => `/transactions/${id}`,
    UPDATE: (id: string) => `/transactions/${id}`,
  },

  // Notification endpoints
  NOTIFICATIONS: {
    CREATE: "/notifications",
    GET: (userId: string) => `/notifications/unread/${userId}`,
    MARK_READ: (notifId: string) => `/notifications/mark-read/${notifId}`,
    MARK_ALL_READ: (userId: string) => `/notifications/mark-all-read/${userId}`,
  },

  // Admin endpoints
  ADMIN: {
    OVERVIEW: "/admin/stats/overview",
    TOP_CURRENCIES: "/admin/stats/top-currencies",
    USERS: "/admin/stats/users",
    TRANSACTIONS: "/admin/transactions",
    REVENUE: "/admin/revenue",
    ANNOUNCEMENTS: "/admin/announcements",
  },
};
