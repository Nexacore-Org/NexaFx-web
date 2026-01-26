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
        <div className="bg-white rounded-xl p-6 shadow-sm">
          {showNotification && (
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
            <div className="w-38 h-38 md:w-58 md:h-58 bg-gray-100 p-4 rounded-lg"></div>
          </div>

          {/* Wallet Address */}
          <div className="mb-4 bg-[#EFEFEF] rounded-xl p-3 md:p-5">
            <label className="text-sm md:text-[18px] text-gray-500 mb-2 block">
              Wallet Address
            </label>
            <div className="flex items-center gap-2 p-2 md:p-3 ">
              <span className="text-sm md:text-[18px] font-semibold text-[#242424] break-all flex-1">
                {walletAddress}
              </span>
              <button
                onClick={handleCopyAddress}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3  md:flex-row flex-col">
            <button
              onClick={handleCopyAddress}
              className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-lg transition-colors md:text-sm"
            >
              {copied ? "Copied!" : "Copy Address"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-300 hover:bg-gray-50 text-gray-900 font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstantModalDeposit;
