"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, X } from "lucide-react";
import type { ConversionData } from "@/types";

interface SuccessModalProps {
  isOpen: boolean;
  data: ConversionData;
  onClose: () => void;
  onViewWallet: () => void;
}

export function SuccessModal({
  isOpen,
  data,
  onClose,
  onViewWallet,
}: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4"
          onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              You have successfully transferred
            </h3>
            <p className="text-gray-600">
              {data.fromAmount}
              {data.fromCurrency} to {data.toAmount}
              {data.toCurrency}.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button
              onClick={onViewWallet}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black">
              View wallet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
