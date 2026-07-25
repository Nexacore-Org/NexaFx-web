import React from "react";
import CurrencyCalculator from "../components/landing/currency-calculator";
import RateTicker from "../components/landing/rate-ticker";

const LandingPage = () => {
  return (
    <div>
      <RateTicker />
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <section style={{ padding: "50px", backgroundColor: "#f0f2f5" }}>
          <CurrencyCalculator />
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
