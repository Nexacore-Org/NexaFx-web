"use client";

import { useEffect, useState } from "react";
import { Copy, PencilLine, CircleUserRound, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/hooks/use-auth-store";
import { getProfile } from "@/lib/api/users";

const truncateAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export function InfoAvatar() {
  const user = useAuthStore((state) => state.user);
  const [walletAddress, setWalletAddress] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);

  const displayName =
    user?.name?.trim() || user?.email || "Account holder";
  const hasWalletAddress = Boolean(walletAddress);
  const walletLabel = hasWalletAddress
    ? truncateAddress(walletAddress)
    : isLoadingWallet
      ? "Loading wallet..."
      : "Not connected";

  useEffect(() => {
    let cancelled = false;

    getProfile()
      .then((profile) => {
        if (cancelled) return;
        setWalletAddress(profile.walletAddress ?? "");
        setIsVerified(Boolean(profile.isVerified));
      })
      .catch(() => {
        if (!cancelled) setWalletAddress("");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingWallet(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCopy = async () => {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard failures
    }
  };

  return (
    <div className="sm:py-8.75 flex flex-col items-start justify-between rounded-2xl border-[0.5px] border-[#E58600] bg-[linear-gradient(83.78deg,rgba(255,162,0,0.3)_-29.73%,rgba(59,130,246,0.3)_143.83%)] p-3.75 sm:flex-row sm:items-center sm:px-5">
      <div className="flex flex-col">
        <div className="flex gap-4">
          <CircleUserRound className="h-[68px] w-[70px] text-muted-foreground" />
          <div className="flex flex-col justify-between sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <h3 className="text-[19px] font-semibold sm:text-2xl">
                {displayName}
              </h3>
              <PencilLine className="size-4 cursor-pointer" aria-hidden="true" />
            </div>

            <div className="flex items-center gap-2.5 text-[14px] font-medium sm:hidden">
              Wallet address: {walletLabel}
              <button
                type="button"
                onClick={handleCopy}
                disabled={!walletAddress}
                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={
                  hasWalletAddress
                    ? "Copy wallet address"
                    : "Wallet address not connected"
                }
                title={
                  hasWalletAddress
                    ? copied
                      ? "Copied!"
                      : "Copy wallet address"
                    : "Not connected"
                }
              >
                {copied ? (
                  <Check className="size-4 text-green-500" />
                ) : (
                  <Copy className="size-4 max-sm:size-3" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 hidden items-center gap-2.5 text-[14px] font-medium sm:flex">
          Wallet address: {walletLabel}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!walletAddress}
            className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={
              hasWalletAddress
                ? "Copy wallet address"
                : "Wallet address not connected"
            }
            title={
              hasWalletAddress
                ? copied
                  ? "Copied!"
                  : "Copy wallet address"
                : "Not connected"
            }
          >
            {copied ? (
              <Check className="size-4 text-green-500" />
            ) : (
              <Copy className="size-4 max-sm:size-2.5" />
            )}
          </button>
        </div>
      </div>

      <button
        className={cn(
          "max-sm:mt-4 h-8 cursor-pointer rounded-[35px] border px-7 text-[14px] font-semibold sm:h-11",
          isVerified
            ? "border-[#3B82F6] bg-[#3b82f61a]"
            : "border-[#E58600] bg-[#E5860033]",
        )}
      >
        {isVerified ? "Verified ID" : "Unverified ID"}
      </button>
    </div>
  );
}
