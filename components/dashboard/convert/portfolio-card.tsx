interface PortfolioCardProps {
  symbol: string;
  value: number;
  change: number;
  isPositive: boolean;
}

export function PortfolioCard({
  symbol,
  value,
  change,
  isPositive,
}: PortfolioCardProps) {
  return (
    <div className="bg-white rounded-full p-4 shadow-md border border-[#79797966]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-900">{symbol}</span>
        </div>

        <div className="text-right flex gap-2 items-center">
          <div className="font-semibold text-gray-900">${value.toFixed(2)}</div>
          <div
            className={`text-[10px] ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}>
            {isPositive ? "+" : ""}
            {change.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}
