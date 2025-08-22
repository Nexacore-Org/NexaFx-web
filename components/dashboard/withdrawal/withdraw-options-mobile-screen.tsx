"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWithdrawalStore } from "@/store/withdrawalStore";
import {
  ArrowLeftRight,
  FolderSymlink,
  SquareArrowOutUpRight,
  XIcon,
} from "lucide-react";

export default function WithdrawOptionsMobileScreen() {
  const {
    isMobileWithdrawOptionsOpen,
    closeMobileWithdrawOptions,
    openWithdrawModal,
  } = useWithdrawalStore();

  const handleShowWithdrawModal = () => {
    closeMobileWithdrawOptions();
    openWithdrawModal();
  };
  return (
    <Dialog
      open={isMobileWithdrawOptionsOpen}
      onOpenChange={closeMobileWithdrawOptions}
    >
      <DialogPortal>
        <DialogOverlay className="md:hidden fixed inset-0 z-50 bg-black/50 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-200" />
        <DialogContent className="md:hidden fixed bottom-0 inset-x-0 max-w-full translate-x-0 z-[60] rounded-t-2xl bg-white border-t border-gray-200 p-4 translate-y-full data-[state=open]:translate-y-0 transition-transform duration-300 focus:outline-none">
          <DialogTitle className="text-lg font-semibold">Withdraw</DialogTitle>
          <div className="space-y-3">
            <p className="text-lg">Select a Deposit Method</p>
            <div className="space-y-3">
              <div
                className="flex flex-col space-y-3 bg-white rounded-xl shadow-lg p-4 cursor-pointer"
                onClick={handleShowWithdrawModal}
              >
                <p className="text-lg font-medium flex items-center space-x-3">
                  <FolderSymlink className="text-chart-5" />
                  <span>Withdraw to Wallet</span>
                </p>
                <p className="text-sidebar-accent-foreground">
                  Send your crypto to any external wallet address — fast,
                  secure, and easy
                </p>
                <p className="font-medium text-sm">Fee: 0%</p>
              </div>
              <div className="flex justify-between items-start bg-white rounded-xl shadow-lg p-4 cursor-pointer">
                <div className="flex flex-col space-y-3">
                  <p className="text-lg font-medium flex items-center space-x-3">
                    <ArrowLeftRight className="text-chart-5" />
                    <span>Sell for Fiat (via MoonPay)</span>
                  </p>
                  <p className="text-sidebar-accent-foreground">
                    Sell your crypto and receive fiat into your bank or card
                    account
                  </p>
                  <p className="font-medium text-sm">Fee: 0%</p>
                </div>
                <SquareArrowOutUpRight />
              </div>
            </div>
          </div>
          <DialogClose
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 dark:hover:bg-white/10"
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
