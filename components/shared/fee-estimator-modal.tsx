"use client";

import { useState, useMemo } from "react";
import { estimateFee, FeeEstimate } from "@/lib/utils/fee-calculator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FeeEstimatorModal() {
  const [type, setType] = useState<"Convert" | "Withdraw">("Convert");
  const [amount, setAmount] = useState("250000");
  const [fromCurrency, setFromCurrency] = useState("NGN");
  const [toCurrency, setToCurrency] = useState("USD");

  const feeEstimate: FeeEstimate | null = useMemo(() => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return null;

    try {
      return estimateFee(type, numericAmount, fromCurrency, toCurrency);
    } catch (error) {
      console.error("Fee estimation error:", error);
      return null;
    }
  }, [type, amount, fromCurrency, toCurrency]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link">Calculate fees</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Fee Estimator</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="type" className="text-right">
              Type
            </label>
            <Select
              onValueChange={(value: "Convert" | "Withdraw") => setType(value)}
              defaultValue={type}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Convert">Convert</SelectItem>
                <SelectItem value="Withdraw">Withdraw</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="amount" className="text-right">
              Amount
            </label>
            <Input
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="from" className="text-right">
              From
            </label>
            <Select onValueChange={setFromCurrency} defaultValue={fromCurrency}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NGN">NGN</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type === "Convert" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="to" className="text-right">
                To
              </label>
              <Select onValueChange={setToCurrency} defaultValue={toCurrency}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="NGN">NGN</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {feeEstimate && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Transaction amount:</span>
              <span>
                {feeEstimate.inputAmount.toLocaleString()}{" "}
                {feeEstimate.inputCurrency}
              </span>
            </div>
            <div className="flex justify-between">
              <span>
                Platform fee ({feeEstimate.platformFeePercent * 100}%):
              </span>
              <span>
                {feeEstimate.platformFee.toLocaleString()}{" "}
                {feeEstimate.inputCurrency}
              </span>
            </div>
            {feeEstimate.networkFee !== undefined && (
              <div className="flex justify-between">
                <span>Network fee:</span>
                <span>
                  {feeEstimate.networkFee.toLocaleString()}{" "}
                  {feeEstimate.inputCurrency}
                </span>
              </div>
            )}
            <hr className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total fees:</span>
              <span>
                {feeEstimate.totalFee.toLocaleString()}{" "}
                {feeEstimate.inputCurrency}
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>You receive:</span>
              <span>
                {feeEstimate.outputAmount.toLocaleString()}{" "}
                {feeEstimate.outputCurrency}
              </span>
            </div>
          </div>
        )}
        <Button>Start {type.toLowerCase()}</Button>
      </DialogContent>
    </Dialog>
  );
}
