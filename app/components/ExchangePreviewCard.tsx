import { Repeat } from "lucide-react";

export default function ExchangePreviewCard() {
  return (
    <div className="w-full max-w-md p-2 bg-white border border-[#E2E8F0] rounded-lg shadow-md">
      <div className="p-4 rounded-lg bg-gradient-to-t from-[#FEF9C3] to-[#EFF6FF] hover:opacity-90 transition">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-sm text-gray-500">From</span>
            <div className="text-lg font-bold text-[#0F172A]">
              NGN{" "}
              <span className="font-normal text-sm text-gray-500">
                Nigerian Naira
              </span>
            </div>
          </div>

          <div className="bg-white p-2 rounded-full shadow-md">
            <Repeat className="w-5 h-5 text-[#3B82F6]" />
          </div>

          <div className="text-right">
            <span className="text-sm text-gray-500">To</span>
            <div className="text-lg font-bold text-[#0F172A]">
              USD{" "}
              <span className="font-normal text-sm text-gray-500">
                US Dollar
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Amount Box */}
          <div className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2 bg-white">
            <div className="text-sm text-[#64748B]">Amount</div>
            <div className="text-[16px] font-semibold text-[#0F172A] mt-1">
              100,000 NGN
            </div>
          </div>

          {/* You'll receive Box */}
          <div className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2 bg-white">
            <div className="text-sm text-[#64748B]">You'll receive</div>
            <div className="text-[16px] font-semibold text-[#0F172A] mt-1">
              ~65.78 USD
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center w-full border border-[#E2E8F0] rounded-lg px-4 py-3 text-[#0F172A] font-medium bg-white">
            <span className="text-sm text-[#64748B]">Exchange Rate</span>
            <span className="text-sm text-[#0F172A] font-medium">
              1 USD = 1,520.25 NGN
            </span>
          </div>
        </div>

        <button className="w-full py-3 rounded-md text-white font-bold text-sm bg-gradient-to-r from-[#3B82F6] to-[#EAB308] hover:opacity-90 transition">
          Exchange Now
        </button>
      </div>
    </div>
  );
}
