"use client";

import { useState } from "react";
import { Download, Upload, Copy, ChevronDown, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransactionsTable } from "@/components/dashboard/transaction/transactions-table";
import {
  BalanceCard,
  ActionButton,
  MobileActionButton,
  CurrencyDropdownItem,
  CryptoRateCard,
  currencyOptions,
  mobileActions,
  currencyValues,
  cryptoRates,
} from "@/components/dashboard/home";
import Image from "next/image";

const transactionData = [
  {
    id: 1,
    type: "Deposit",
    fromCurrency: "NGN",
    toCurrency: "NGN",
    date: "04.07.2025 12:40 AM",
    status: "Success" as const,
    amount: "+200,000 NGN",
    usdAmount: "80 USD",
  },
  {
    id: 2,
    type: "Withdraw",
    fromCurrency: "NGN",
    toCurrency: "NGN",
    date: "04.07.2025 12:40 AM",
    status: "Success" as const,
    amount: "+200,000 NGN",
    usdAmount: "80 USD",
  },
  {
    id: 3,
    type: "Convert",
    fromCurrency: "NGN",
    toCurrency: "USD",
    date: "04.07.2025 12:40 AM",
    status: "Failed" as const,
    amount: "+200,000 NGN",
    usdAmount: "80 USD",
  },
];

export default function DashboardContent() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState("ETH");

  return (
    <div className="px-0 md:px-4 lg:px-0 w-full md:py-[2.25rem]">
      <div className="w-full relative h-auto md:px-7 md:mt-20">
        <div className="rounded-xl z-0 hidden md:block bg-[linear-gradient(240deg,rgba(160,195,253,0.80)_-1.74%,rgba(255,231,156,0.80)_99.3%)] absolute -top-20  inset-x-0 h-74 w-full p-6 mb-6">
          <h2 className="text-text-primary font-semibold text-2xl leading-[140%] tracking-[0.48px]">
            Overview
          </h2>
        </div>
        <div
          className="flex p-[1.411rem] h-full flex-col rounded-b-lg  items-start relative z-20 gap-5 lg:gap-[3.5rem] self-stretch md:rounded-2xl 
          bg-[linear-gradient(240deg,rgba(160,195,253,0.40)_-1.74%,rgba(255,231,156,0.40)_99.3%)] 
          md:bg-bg-main-desktop md:bg-none
          md:shadow-[8px_8px_9px_0px_rgba(0,0,0,0.15)]
          shadow-[0px_0px_0px_0px_rgba(0,0,0,0.15)]"
        >
          <div className=" w-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <span className="text-text-secondary text-sm font-semibold leading-[140%]">
                  Total balance
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                >
                  {balanceVisible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="md:flex p-[0.625rem] flex-col items-start hidden gap-[0.565rem] rounded-lg bg-brand-secondary">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>0x5A8...beF1832</span>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>

            <div className=" flex items-baseline min-h-10">
              <span className="text-text-naira text-[1.423rem] font-semibold leading-[100%] tracking-[-0.228px] opacity-90">
                {balanceVisible ? "₦" : "₦"}
              </span>
              <span className="text-black text-[1.751rem] font-bold leading-[100%] tracking-[-0.28px] opacity-90">
                {balanceVisible ? "325,980" : "••••••••"}
              </span>
              <span className="text-black text-[2.001rem] font-semibold leading-[100%] tracking-[-0.32px] opacity-90">
                {balanceVisible ? "." : ""}
              </span>
              <span className="text-black text-[1.501rem] font-semibold leading-[100%] tracking-[-0.24px] opacity-90">
                {balanceVisible ? "65" : ""}
              </span>
            </div>
          </div>

          <div className="md:flex space-x-4 hidden w-full">
            <ActionButton icon={Download} label="Deposit" variant="primary" />
            <ActionButton icon={Upload} label="Withdraw" variant="secondary" />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <BalanceCard title="NGN" value="₦250,250" />
            <BalanceCard title="" value="">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex p-[0.625rem] justify-start w-fit items-center gap-[0.5rem] rounded-lg bg-bg-dropdown hover:bg-bg-dropdown-hover"
                  >
                    <Image
                      src={
                        currencyOptions.find((c) => c.code === selectedCurrency)
                          ?.icon || ""
                      }
                      alt={selectedCurrency}
                      width={16}
                      height={16}
                    />
                    <span className="text-sm text-gray-600">
                      {selectedCurrency}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {currencyOptions.map((currency) => (
                    <CurrencyDropdownItem
                      key={currency.code}
                      currency={currency}
                      onClick={() => setSelectedCurrency(currency.code)}
                    />
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="text-black text-[1.5rem] font-semibold leading-[140%]">
                {currencyValues[selectedCurrency]}
              </div>
            </BalanceCard>
          </div>
        </div>
      </div>

      <div className="md:hidden px-2 md:px-0 grid grid-cols-3 gap-4 mt-8">
        {mobileActions.map((action, index) => (
          <MobileActionButton key={index} {...action} />
        ))}
      </div>

      <div className="my-4 px-2 md:px-0">
        <div className="flex justify-between md:hidden mb-2 mt-14 items-center px-2">
          <div className="text-black text-center text-[0.875rem] font-medium leading-[140%]">
            Exchange Rates
          </div>
          <div className="text-text-see-all text-center text-[0.61rem] font-semibold leading-[140%] tracking-[0.195px]">
            See All
          </div>
        </div>
        <div className="flex gap-4 py-3 overflow-x-scroll w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {cryptoRates.map((crypto, index) => (
            <CryptoRateCard key={index} crypto={crypto} />
          ))}
        </div>
      </div>

      <div className="px-2 mt-10 md:mt-5 md:px-0">
        <div className="flex p-4 justify-between items-center self-stretch bg-bg-transactions-header text-black text-center text-[0.875rem] md:text-[1.3125rem] font-medium leading-[140%]">
          Recent Transactions
        </div>
        <TransactionsTable transactions={transactionData} />
      </div>
    </div>
  );
}
