import React, { useState, useEffect } from "react";

const CurrencyCalculator = () => {
  const [fromCurrency, setFromCurrency] = useState("NGN");
  const [toCurrency, setToCurrency] = useState("USD");
  const [amount, setAmount] = useState("250000");
  const [rate, setRate] = useState<number | null>(null);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateTimestamp, setRateTimestamp] = useState<string | null>(null);

  const availableCurrencies = [
    "NGN",
    "USD",
    "EUR",
    "GBP",
    "CAD",
    "AUD",
    "JPY",
    "CNY",
    "ZAR",
    "GHS",
  ];

  useEffect(() => {
    const fetchRate = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://open.er-api.com/v6/latest/${fromCurrency}`,
        );
        const data = await response.json();
        if (data.result === "success") {
          setRate(data.rates[toCurrency]);
          setRateTimestamp(
            new Date(data.time_last_update_utc).toLocaleString(),
          );
        } else {
          setError(
            "Live rates temporarily unavailable. Sign up to see current rates.",
          );
        }
      } catch (error) {
        setError(
          "Live rates temporarily unavailable. Sign up to see current rates.",
        );
      }
      setLoading(false);
    };

    if (fromCurrency && toCurrency) {
      fetchRate();
    }
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
    if (rate && amount) {
      setConvertedAmount(parseFloat(amount) * rate);
    }
  }, [rate, amount]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div>
      <h2>How much can you convert?</h2>
      <div>
        <div>
          <label>From</label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
          >
            {availableCurrencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <button onClick={handleSwapCurrencies}>↕</button>
        <div>
          <label>To</label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
          >
            {availableCurrencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          {loading && <p>Fetching live rate...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {convertedAmount !== null && !loading && !error && (
            <p>
              {new Intl.NumberFormat().format(parseFloat(amount))}{" "}
              {fromCurrency} = {new Intl.NumberFormat().format(convertedAmount)}{" "}
              {toCurrency}
            </p>
          )}
        </div>
      </div>
      {rateTimestamp && <p>Rate as of {rateTimestamp}</p>}
      <a href="/signup">
        <button>Sign up to convert</button>
      </a>
    </div>
  );
};

export default CurrencyCalculator;
