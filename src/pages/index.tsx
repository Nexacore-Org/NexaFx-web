import React from "react";
import CurrencyCalculator from "../components/landing/currency-calculator";

const LandingPage = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <section style={{ padding: "50px", backgroundColor: "#f0f2f5" }}>
        <CurrencyCalculator />
      </section>
    </div>
  );
};

export default LandingPage;
