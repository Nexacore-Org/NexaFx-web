"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

const marketData = [
    { pair: "ETH", rate: "$2,312.45", change: "+2.4%", up: true, icon: "/icons/eth.svg" },
    { pair: "BTC", rate: "$42,110.20", change: "+1.2%", up: true, icon: "/icons/bnb.svg" },
    { pair: "BNB", rate: "$312.45", change: "-0.8%", up: false, icon: "/icons/bnb.svg" },
    { pair: "SOL", rate: "$98.32", change: "+5.4%", up: true, icon: "/icons/bnb.svg" },
    { pair: "USDT", rate: "$1,000.00", change: "0.0%", up: true, icon: "/icons/usdc.svg" },
    { pair: "USDT", rate: "$1,000.00", change: "0.0%", up: true, icon: "/icons/usdc.svg" },
    { pair: "USDT", rate: "$1,000.00", change: "0.0%", up: true, icon: "/icons/usdc.svg" },
];

export function MarketOverview() {
    return (
        <div className="exchange-rates flex items-center overflow-x-auto gap-3">
            {marketData.map((item, index) => (
                <div key={index} className="min-w-[251px] rounded-sm border-[0.43px] border-[#79797966] bg-card p-5 hover:border-primary/50 transition-colors shadow-[4px-4px-12px-0px-#0000001A]">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-medium text-muted-foreground">{item.pair}</p>
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                            <img
                                src={item.icon}
                                alt={item.pair}
                                className="w-full h-full rounded-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-lg font-bold tracking-tight">{item.rate}</p>
                        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${item.up ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                            }`}>
                            {item.up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                            {item.change}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
