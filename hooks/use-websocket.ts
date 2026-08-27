import { create } from "zustand";
import type { WalletBalance } from "@/lib/api/wallet";
import type { Transaction } from "@/lib/api/transactions";

interface WebSocketMessage {
  type: "balance_update" | "transaction_update" | "connected";
  data: WalletBalance[] | Transaction | { message: string };
}

interface WebSocketState {
  balance: WalletBalance[] | null;
  transactions: Transaction[];
  isConnected: boolean;
  lastUpdate: number | null;
  subscribe: (token: string) => void;
  unsubscribe: () => void;
}

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function startReconnect(store: {
  subscribe: (token: string) => void;
  getState: () => { accessToken?: string };
}) {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    if (token) {
      store.subscribe(token);
    }
  }, 5000);
}

export const useWebSocket = create<WebSocketState>((set, get) => ({
  balance: null,
  transactions: [],
  isConnected: false,
  lastUpdate: null,

  subscribe: (token: string) => {
    if (ws) {
      ws.close();
      ws = null;
    }

    try {
      ws = new WebSocket(`wss://nexafx-backend.onrender.com/ws`);

      ws.onopen = () => {
        ws?.send(JSON.stringify({ type: "auth", token }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case "connected":
              set({ isConnected: true });
              break;
            case "balance_update":
              set({
                balance: message.data as WalletBalance[],
                lastUpdate: Date.now(),
              });
              break;
            case "transaction_update":
              const tx = message.data as Transaction;
              set((state) => ({
                transactions: [tx, ...state.transactions].slice(0, 50),
                lastUpdate: Date.now(),
              }));
              break;
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        set({ isConnected: false });
        ws = null;
        startReconnect({ subscribe: get().subscribe, getState: get });
      };

      ws.onerror = () => {
        ws?.close();
      };
    } catch {
      startReconnect({ subscribe: get().subscribe, getState: get });
    }
  },

  unsubscribe: () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (ws) {
      ws.close();
      ws = null;
    }
    set({ isConnected: false });
  },
}));
