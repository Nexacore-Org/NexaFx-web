import React, { useState } from "react";
import { verifyBvn } from "../../lib/api/kyc";

const BvnVerificationForm = () => {
  const [bvn, setBvn] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    firstName: string;
    lastName: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyBvn = async () => {
    try {
      const result = await verifyBvn(bvn, dateOfBirth);
      setVerificationResult(result);
      if (!result.verified) {
        setError(
          "BVN verification failed. Please check your BVN and date of birth.",
        );
      }
    } catch (error) {
      setError(
        "An error occurred during BVN verification. Please try again later.",
      );
    }
  };

  return (
    <div>
      <h2>BVN Verification</h2>
      <div>
        <label htmlFor="bvn">BVN</label>
        <input
          type="text"
          id="bvn"
          value={bvn}
          onChange={(e) => setBvn(e.target.value)}
          maxLength={11}
        />
      </div>
      <div>
        <label htmlFor="dateOfBirth">Date of Birth</label>
        <input
          type="date"
          id="dateOfBirth"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />
      </div>
      <button onClick={handleVerifyBvn}>Verify BVN</button>
      {verificationResult && verificationResult.verified && (
        <div style={{ color: "green" }}>
          BVN verified. Name on record: {verificationResult.firstName}{" "}
          {verificationResult.lastName}
        </div>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <p>
        Your BVN is used only to verify your identity. We do not store your BVN
        — only the verification result.
        <a href="/privacy-policy">Privacy Policy</a>
      </p>
    </div>
  );
};

export default BvnVerificationForm;
