"use client";

import { RefreshCw, Shield } from "lucide-react";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "../ui/card";

export default function LeftSideContent() {
  const pathname = usePathname();

  const isSignUp = pathname === "/auth/sign-up";
  const isSignIn = pathname === "/auth/sign-in";

  const exchangeRates = [
    {
      currency: "USD/NGN",
      rate: "1,520.25",
    },
    {
      currency: "EUR/NGN",
      rate: "1,650.80",
    },
    {
      currency: "GBP/NGN",
      rate: "1,950.15",
    },
    {
      currency: "BTC/NGN",
      rate: "92,450,000.00",
    },
  ];

  return (
    <>
      {isSignUp && (
        <div className="mt-auto space-y-6 hidden md:block">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-blue-50 rounded-full p-3 mr-4">
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Secure & Encrypted
              </h3>
              <p className="text-gray-600 text-sm">
                Your data is protected with bank-level security
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 bg-yellow-50 rounded-full p-3 mr-4">
              <RefreshCw className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Fast Verification</h3>
              <p className="text-gray-600 text-sm">
                Quick KYC process to get you started
              </p>
            </div>
          </div>
        </div>
      )}

      {isSignIn && (
        <Card className="bg-gradient-to-br from-[#EFF6FF] to-[#FEF9C3] mt-auto hidden md:block">
          <CardContent>
            <h2 className="font-bold">Exchange rates at a glance</h2>

            <section className="space-y-2 mt-3">
              {exchangeRates.map((rate) => (
                <div key={rate.currency} className="flex justify-between">
                  <p className="tracking-tighter">{rate.currency}</p>
                  <p className="font-bold">{rate.rate}</p>
                </div>
              ))}
            </section>
          </CardContent>
        </Card>
      )}
    </>
  );
}
