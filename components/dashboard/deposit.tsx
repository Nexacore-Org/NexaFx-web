import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowUp,
  Wallet,
  ArrowLeftRight,
  ExternalLink,
  X,
} from "lucide-react";
import InstantModalDeposit from "./InstantDepositModal";
import { MobileNotificationBanner } from "./notification";
import Image from "next/image";

interface DepositMethod {
  id: string;
  title: string;
  description: string;
  fee: string;
  icon: React.ReactNode;
  hasExternalLink?: boolean;
}

type DepositMethodTypes = {
  toggleDeposit: () => void;
};

const DepositMethods: React.FC<DepositMethodTypes> = ({ toggleDeposit }) => {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleCloseDepositFlow = () => {
    setIsQRModalOpen(false);
    toggleDeposit();
  };

  const depositMethods: DepositMethod[] = [
    {
      id: "instant",
      title: "Instant Deposit",
      description:
        "Send crypto directly to your NexaFX wallet address. Just copy your address and make the transfer.",
      fee: "0%",
      icon: (
        <Image
          src={`/icons/instant_deposit.svg`}
          alt={"dsdsds"}
          width={20}
          height={20}
        />
      ),
    },
    {
      id: "exchange",
      title: "Buy Crypto (via MoonPay)",
      description: "Buy crypto instantly through MoonPay.",
      fee: "0%",
      icon: <ArrowLeftRight className="w-5 h-5" />,
      hasExternalLink: true,
    },
  ];

  const handleMoonPayOpen = () => {
    // Replace with actual MoonPay URL and user wallet address
    const moonPayUrl = `https://buy.moonpay.com?apiKey=YOUR_API_KEY&walletAddress=USER_WALLET_ADDRESS`;
    window.open(moonPayUrl, "_blank");
  };

  const MethodCard: React.FC<{ method: DepositMethod }> = ({ method }) => (
    <button
      className="w-full text-left p-4 bg-card border border-border rounded-lg hover:border-border/70 transition-colors"
      onClick={() => {
        if (method.id === "instant") {
          setIsQRModalOpen(true);
        } else if (method.id === "exchange") {
          handleMoonPayOpen();
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5">
            {/* {typeof method.icon === "string" ? (
              <Image
                src={`/icons/${method.icon}`}
                alt={method.title}
                width={20}
                height={20}
              />
            ) : (
              method.icon
            )} */}
            {method.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground mb-1 text-sm md:text-base">
              {method.title}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-2">
              {method.description}
            </p>
            <p className="text-xs md:text-sm font-medium text-foreground">
              Fee: {method.fee}
            </p>
          </div>
        </div>
        {method.hasExternalLink && (
          <ExternalLink className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
      </div>
    </button>
  );

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block w-full px-3 min-h-screen">
        {isQRModalOpen && (
          <div
            className="fixed inset-0 bg-[#00000071] bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsQRModalOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <InstantModalDeposit
                isMobile={false}
                onClose={() => setIsQRModalOpen(false)}
              />
            </div>
          </div>
        )}
        <div className="w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <button
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                onClick={toggleDeposit}
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-semibold">Deposit</h1>
            </div>
            <button className="px-6 py-2.5 border-2 border-border rounded-full font-medium hover:bg-muted transition-colors flex items-center gap-2">
              Withdraw
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

          {/* Deposit Methods */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
            <h2 className="text-lg font-medium mb-4">
              Select a Deposit Method
            </h2>
            <div className="space-y-3">
              {depositMethods.map((method) => (
                <MethodCard key={method.id} method={method} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      {typeof window !== "undefined" && window.innerWidth < 768 && (
        <>
          {!isQRModalOpen ? (
            <div className="md:hidden fixed inset-0 bg-[#00000071] bg-opacity-50 flex items-end justify-center z-50 p-0">
              <div className="bg-card text-card-foreground w-full rounded-t-2xl max-h-[90vh] overflow-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h2 className="text-lg font-semibold">Deposit</h2>
                  <button
                    onClick={handleCloseDepositFlow}
                    className="p-1 hover:bg-muted rounded-lg transition-colors"
                    aria-label="Close deposit modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-4">
                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    Select a Deposit Method
                  </p>
                  <div className="space-y-3">
                    {depositMethods.map((method) => (
                      <MethodCard key={method.id} method={method} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="md:hidden p-2 fixed inset-0 bg-[#00000071] bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setIsQRModalOpen(false)}
            >
              {!showNotification && (
                <MobileNotificationBanner
                  message="Your deposit of"
                  amount="₦50,000"
                  onClose={() => setShowNotification(false)}
                />
              )}

              <div
                className="bg-card text-card-foreground w-full mt-8 rounded-2xl max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                {/* <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-base md:text-lg font-semibold">
                    Wallet Address
                  </h2>
                  <button
                    onClick={() => setIsQRModalOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div> */}
                <InstantModalDeposit
                  onClose={handleCloseDepositFlow}
                  isMobile={true}
                />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default DepositMethods;
