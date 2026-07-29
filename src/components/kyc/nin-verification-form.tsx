import React, { useState } from "react";
import { verifyNin } from "../../lib/api/kyc";

const NinVerificationForm = () => {
  const [nin, setNin] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    firstName: string;
    lastName: string;
    middleName?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyNin = async () => {
    try {
      const result = await verifyNin(nin, phoneNumber);
      setVerificationResult(result);
      if (!result.verified) {
        setError(
          "NIN verification failed. Check your NIN and registered phone number.",
        );
      }
    } catch (error) {
      setError(
        "An error occurred during NIN verification. Please try again later.",
      );
    }
  };

  return (
    <div>
      <h2>NIN Verification</h2>
      <div>
        <label htmlFor="nin">NIN</label>
        <input
          type="text"
          id="nin"
          value={nin}
          onChange={(e) => setNin(e.target.value)}
          maxLength={11}
        />
      </div>
      <div>
        <label htmlFor="phoneNumber">Phone Number</label>
        <input
          type="tel"
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </div>
      <button onClick={handleVerifyNin}>Verify NIN</button>
      {verificationResult && verificationResult.verified && (
        <div style={{ color: "green" }}>
          NIN verified. Name on record: {verificationResult.firstName}{" "}
          {verificationResult.middleName} {verificationResult.lastName}
        </div>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <p>Your NIN is verified in real time and is not stored by NexaFx.</p>
    </div>
  );
};

export default NinVerificationForm;
