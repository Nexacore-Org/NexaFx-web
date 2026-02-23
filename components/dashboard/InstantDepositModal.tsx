import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowUp,
  Wallet,
  ArrowLeftRight,
  RefreshCw,
  ExternalLink,
  X,
  Copy,
  Share2,
  ChevronRight,
} from "lucide-react";
import { DepositNotification } from "./notification";

interface DepositMethod {
  id: string;
  title: string;
  description: string;
  fee: string;
  icon: React.ReactNode;
  hasExternalLink?: boolean;
}

type InstantDepositModalType = {
  onClose: () => void;
  isMobile: boolean;
};

const InstantModalDeposit: React.FC<InstantDepositModalType> = ({
  onClose,
}) => {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Sample wallet address
  const walletAddress = "0x5A08FcdBEA516Cf086572157791dB12CA3beF1B32";

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareAddress = () => {
    if (navigator.share) {
      navigator.share({
        title: "NEXA FX - Deposit",
        text: `Wallet Address: ${walletAddress}`,
      });
    }
  };

  return (
    <>
      {" "}
      <div className="">
        <div className="bg-card text-card-foreground rounded-xl p-6 shadow-sm border border-border/50 relative">
          <button
            onClick={onClose}
            className="absolute right-1 top-1 p-1.5 rounded-md hover:bg-muted transition-colors"
            aria-label="Close deposit modal"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          {!showNotification && (
            <DepositNotification
              message="Your deposit of"
              amount="₦50,000"
              onViewTransaction={() => alert("View Transaction")}
              onClose={() => setShowNotification(false)}
            />
          )}
          <h3 className="text-lg font-semibold text-center mb-3 md:mb-6">
            NEXA FX - Deposit
          </h3>

          {/* QR Code */}
          <div className=" p-6 rounded-lg mb-3 md:mb-6 flex items-center justify-center">
            <div className="w-38 h-38 md:w-58 md:h-58 bg-muted p-4 rounded-lg"></div>
          </div>

          {/* Wallet Address */}
          <div className="mb-4 bg-muted rounded-xl p-3 md:p-5 border border-border/50">
            <label className="text-sm md:text-[18px] flex items-center text-muted-foreground mb-2 ">
              Wallet Address <ChevronRight size={20} />
            </label>
            <div className="flex items-center gap-2 p-2 md:p-3 ">
              <span className="text-sm md:text-[18px] font-semibold text-foreground break-all flex-1">
                {walletAddress}
              </span>
              <button
                onClick={handleCopyAddress}
                className="p-1 hover:bg-background rounded"
                aria-label="Copy wallet address"
              >
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3  md:flex-row flex-col">
            <button
              onClick={handleCopyAddress}
              className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition-colors md:text-sm"
            >
              {copied ? "Copied!" : "Copy Address"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 border-2 border-border hover:bg-muted text-foreground font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstantModalDeposit;
