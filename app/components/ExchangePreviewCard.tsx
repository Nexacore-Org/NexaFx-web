import { Repeat } from "lucide-react";

export default function ExchangePreviewCard() {
  return (
    <div className="w-full max-w-md p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-md">
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

        <div className="bg-gray-100 p-2 rounded-full">
          <Repeat className="w-4 h-4 text-gray-500" />
        </div>

        <div className="text-right">
          <span className="text-sm text-gray-500">To</span>
          <div className="text-lg font-bold text-[#0F172A]">
            USD{" "}
            <span className="font-normal text-sm text-gray-500">US Dollar</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Amount</label>
          <div className="w-full border border-[#E2E8F0] rounded-lg px-4 py-3 text-[#0F172A] font-medium bg-white">
            100,000 NGN
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">
            You'll receive
          </label>
          <div className="w-full border border-[#E2E8F0] rounded-lg px-4 py-3 text-[#0F172A] font-medium bg-white">
            ~65.78 USD
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-4">Exchange Rate</div>
      <div className="text-sm font-medium text-[#0F172A] mb-6">
        1 USD = 1,520.25 NGN
      </div>

      <button className="w-full py-3 rounded-full text-white font-semibold text-sm bg-gradient-to-r from-[#3B82F6] to-[#EAB308] hover:opacity-90 transition">
        Exchange Now
      </button>
    </div>
  );
}
