"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowDown, Info, Loader2, X } from "lucide-react";
import type { ConversionData } from "@/types";

interface ProcessingModalProps {
  isOpen: boolean;
  data: ConversionData;
  onCancel: () => void;
}

export function ProcessingModal({
  isOpen,
  data,
  onCancel,
}: ProcessingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{"You're about to convert"}</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold">{data.fromAmount}</div>
              <div className="text-sm text-gray-600">{data.fromCurrency}</div>
            </div>
            <ArrowDown className="w-5 h-5 text-gray-400 rotate-90" />
            <div className="text-center">
              <div className="text-2xl font-semibold">{data.toAmount}</div>
              <div className="text-sm text-gray-600">{data.toCurrency}</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm text-gray-600">Converting...</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>Fees</span>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs">₦</span>
              </div>
              <span>{data.fee}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" disabled className="flex-1">
              Cancel
            </Button>
            <Button
              disabled
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black">
              Proceed
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
