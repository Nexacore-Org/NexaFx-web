// TODO: Wire live exchange rates once backend API is fixed.
// These are static example values for the landing page.

const rates = [
  { pair: "NGN/USD", buy: "1,540.25", sell: "1,535.10" },
  { pair: "NGN/EUR", buy: "1,670.80", sell: "1,664.50" },
  { pair: "NGN/GBP", buy: "1,950.40", sell: "1,942.30" },
];

export default function MarketRates() {
  return (
    <section
      id="market-rates"
      className="max-w-[1440px] mx-auto px-6 md:px-12 py-24 mb-32"
    >
      <div className="flex flex-col items-center text-center mb-16">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
          Market <span className="text-brand">Rates</span>
        </h2>
        <p className="text-slate-600 max-w-2xl">
          Stay informed with current exchange rates.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-slate-50 border-b font-semibold text-sm text-slate-600">
            <div>Currency Pair</div>
            <div className="text-right">Buy Rate</div>
            <div className="text-right">Sell Rate</div>
          </div>
          {rates.map((r) => (
            <div
              key={r.pair}
              className="grid grid-cols-3 gap-4 px-6 py-4 border-b last:border-b-0 hover:bg-slate-50 transition"
            >
              <div className="font-medium">{r.pair}</div>
              <div className="text-right text-slate-700">{r.buy}</div>
              <div className="text-right text-slate-700">{r.sell}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4 text-center">
          Rates are indicative and may vary. Live rates coming soon.
        </p>
      </div>
    </section>
  );
}
