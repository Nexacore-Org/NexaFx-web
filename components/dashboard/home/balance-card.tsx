import { Info, ChevronDown } from "lucide-react";

export function BalanceCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-500 via-slate-300 to-yellow-400 p-8 text-white">
      <div className="relative z-10">
        <div className="mb-6 flex items-center gap-2">
          <span className="text-white/80">Total Balance</span>
          <Info className="h-4 w-4 text-white/60" />
        </div>

        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold">N325,980.65</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/[6%] flex gap-2 rounded-lg p-2">
            <div className="bg-white/40 h-full w-px" />
            <div className="flex flex-col">
              <div className="text-white/80 text-sm mb-1">NGN</div>
              <div className="text-2xl font-semibold">N325,980.65</div>
            </div>
          </div>

          <div className="bg-white/[6%] flex gap-2 rounded-lg p-2">
            <div className="bg-white/40 h-full w-px" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-white/80 text-sm mb-1">
                <span>USD</span>
                <ChevronDown className="h-3 w-3" />
              </div>
              <div className="text-2xl font-semibold">$1,160.52</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
