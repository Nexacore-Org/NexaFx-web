"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, Info } from "lucide-react";
import type { ConversionData } from "@/types";
import { useConversion } from "@/hooks/useConversion";

interface ConfirmationModalProps {
  isOpen: boolean;
  data: ConversionData;
  onCancel: () => void;
  onProceed: () => void;
}

export function ConfirmationModal({
  isOpen,
  data,
  onCancel,
  onProceed,
}: ConfirmationModalProps) {
  const { setConversionState } = useConversion();
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md py-8">
        <DialogHeader>
          <DialogTitle>{"You're about to convert"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 w-full px-4 ">
          <div className="flex items-center w-full justify-between py-4 gap-4">
            <div className="text-center flex items-center justify-center gap-2">
              <div className="text-2xl ">{data.fromAmount}</div>
              <div className="text-lg text-black font-bold">
                {data.fromCurrency}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 " />
            <div className="text-center flex items-center justify-center gap-2">
              <div className="text-2xl ">{data.toAmount}</div>
              <div className="text-lg text-black font-bold">
                {data.toCurrency}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>Fees</span>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 25 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.375 18.5195H10.375"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18.375 14.5195H10.375"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4.375 22.5195H20.375C20.9054 22.5195 21.4141 22.3088 21.7892 21.9337C22.1643 21.5587 22.375 21.05 22.375 20.5195V4.51953C22.375 3.9891 22.1643 3.48039 21.7892 3.10532C21.4141 2.73024 20.9054 2.51953 20.375 2.51953H8.375C7.84457 2.51953 7.33586 2.73024 6.96079 3.10532C6.58571 3.48039 6.375 3.9891 6.375 4.51953V20.5195C6.375 21.05 6.16429 21.5587 5.78921 21.9337C5.41414 22.3088 4.90543 22.5195 4.375 22.5195ZM4.375 22.5195C3.84457 22.5195 3.33586 22.3088 2.96079 21.9337C2.58571 21.5587 2.375 21.05 2.375 20.5195V11.5195C2.375 10.9891 2.58571 10.4804 2.96079 10.1053C3.33586 9.73025 3.84457 9.51953 4.375 9.51953H6.375"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17.375 6.51953H11.375C10.8227 6.51953 10.375 6.96725 10.375 7.51953V9.51953C10.375 10.0718 10.8227 10.5195 11.375 10.5195H17.375C17.9273 10.5195 18.375 10.0718 18.375 9.51953V7.51953C18.375 6.96725 17.9273 6.51953 17.375 6.51953Z"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span>{data.fee}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-10 text-md"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setConversionState("processing");
                setTimeout(() => {
                  setConversionState("success");
                }, 3000);
              }}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 h-10 text-md text-black"
            >
              Proceed
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
