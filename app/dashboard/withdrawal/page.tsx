"use client";

import WithdrawalSuccessModal from "@/components/dashboard/modals/withdraw-success-modal";
import WithdrawalModal from "@/components/dashboard/modals/withdrawal-modal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useWithdrawalStore } from "@/store/withdrawalStore";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowUp,
  FolderSymlink,
  SquareArrowOutUpRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WithdrawalPage() {
  const { isWithdrawModalOpen, openWithdrawModal, isSuccessModalOpen } =
    useWithdrawalStore();
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      router.replace("/dashboard");
      openWithdrawModal();
    }
  }, [isMobile, openWithdrawModal, router]);

  return (
    <section className="p-5">
      <div className="flex justify-between items-center">
        <p
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLeft />
          <span className="text-xl font-semibold">Withdrawal</span>
        </p>
        <button className="relative inline-flex items-center gap-2 rounded-full p-[1px] bg-gradient-to-r from-chart-5 to-text-link font-semibold cursor-pointer">
          <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-black">
            <span>Deposit</span>
            <ArrowUp className="w-4 h-4" />
          </span>
        </button>
      </div>{" "}
      <div className="mt-10 space-y-3">
        <p className="text-lg">Select a Deposit Method</p>
        <div className="space-y-3">
          <div
            className="flex flex-col space-y-3 bg-white rounded-xl shadow-lg p-4 cursor-pointer"
            onClick={() => openWithdrawModal()}
          >
            <p className="text-lg font-medium flex items-center space-x-3">
              <FolderSymlink />
              <span>Withdraw to Wallet</span>
            </p>
            <p className="text-sidebar-accent-foreground">
              Send your crypto to any external wallet address — fast, secure,
              and easy
            </p>
            <p className="font-medium text-sm">Fee: 0%</p>
          </div>

          <div className="flex justify-between items-start bg-white rounded-xl shadow-lg p-4 cursor-pointer">
            <div className="flex flex-col space-y-3">
              <p className="text-lg font-medium flex items-center space-x-3">
                <ArrowLeftRight />
                <span>Sell for Fiat (via MoonPay)</span>
              </p>
              <p className="text-sidebar-accent-foreground">
                Sell your crypto and receive fiat into your bank or card account
              </p>
              <p className="font-medium text-sm">Fee: 0%</p>
            </div>
            <SquareArrowOutUpRight />
          </div>
        </div>
      </div>
      {isWithdrawModalOpen && <WithdrawalModal />}
      {isSuccessModalOpen && <WithdrawalSuccessModal />}
    </section>
  );
}
