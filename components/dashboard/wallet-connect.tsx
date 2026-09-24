"use client";

import { useState, useEffect } from "react";
import { Wallet, Plug, Unplug } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
      on: (event: string, cb: (...args: unknown[]) => void) => void;
      removeListener: (event: string, cb: (...args: unknown[]) => void) => void;
    };
  }
}

export function WalletConnect() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const hasEthereum = typeof window !== "undefined" && !!window.ethereum;
    setIsAvailable(hasEthereum);

    if (hasEthereum && window.ethereum) {
      const handleAccountsChanged = (accounts: unknown[]) => {
        if (accounts.length === 0) {
          setIsConnected(false);
          setAddress(null);
        } else {
          setIsConnected(true);
          setAddress(accounts[0] as string);
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts) => {
          const arr = accounts as string[];
          if (arr && arr.length > 0) {
            setIsConnected(true);
            setAddress(arr[0]);
          }
        })
        .catch(() => {});

      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  const handleConnect = async () => {
    if (!window.ethereum) return;
    setIsConnecting(true);
    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      if (accounts && accounts.length > 0) {
        setIsConnected(true);
        setAddress(accounts[0]);
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAddress(null);
  };

  if (!isAvailable) return null;

  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return (
    <div className="inline-flex items-center">
      <div className="relative group">
        <button
          onClick={isConnected ? handleDisconnect : handleConnect}
          disabled={isConnecting}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium",
            "border border-border transition-all duration-200",
            "hover:shadow-md",
            isConnected
              ? "bg-green-500/10 text-green-600 border-green-500/30"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
            isConnecting && "opacity-60 cursor-wait",
          )}
        >
          {isConnected ? (
            <Unplug className="h-4 w-4" />
          ) : (
            <Plug className="h-4 w-4" />
          )}
          {isConnecting
            ? "Connecting..."
            : isConnected
              ? displayAddress
              : "Connect Wallet"}
        </button>
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500" />
        </span>
      </div>
      <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 whitespace-nowrap">
        Experimental
      </span>
    </div>
  );
}
