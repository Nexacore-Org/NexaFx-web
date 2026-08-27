import React, { useState, useEffect, useRef } from "react";
import "./rate-ticker.css";

const RateTicker = () => {
  const [rates, setRates] = useState<any>(null);
  const [prevRates, setPrevRates] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

  const currencyPairs = ["USD", "EUR", "GBP", "CAD", "AUD", "ZAR", "GHS"];

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch("https://open.er-api.com/v6/latest/NGN");
        const data = await response.json();
        if (data.result === "success") {
          setPrevRates(rates);
          setRates(data.rates);
        } else {
          setError("Failed to fetch rates.");
        }
      } catch (error) {
        setError("Failed to fetch rates.");
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 60000);

    return () => clearInterval(interval);
  }, [rates]);

  if (error || !rates) {
    return null;
  }

  const getChange = (currency: string) => {
    if (!prevRates || !rates) return { change: 0, direction: "" };
    const change =
      ((rates[currency] - prevRates[currency]) / prevRates[currency]) * 100;
    const direction = change >= 0 ? "▲" : "▼";
    return { change: change.toFixed(2), direction };
  };

  return (
    <div
      className="rate-ticker-container"
      aria-label="Live currency rates ticker"
      role="marquee"
    >
      <div className="rate-ticker" ref={tickerRef}>
        {currencyPairs.map((currency) => {
          const { change, direction } = getChange(currency);
          return (
            <div key={currency} className="rate-pill">
              <span>NGN/{currency}</span>
              <span>₦{(1 / rates[currency]).toFixed(2)}</span>
              <span style={{ color: direction === "▲" ? "green" : "red" }}>
                {direction} {change}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RateTicker;
