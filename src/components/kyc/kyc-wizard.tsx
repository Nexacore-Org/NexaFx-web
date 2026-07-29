import React, { useState } from "react";
import BvnVerificationForm from "./bvn-verification-form";
import NinVerificationForm from "./nin-verification-form";

const KycWizard = () => {
  const [verificationMethod, setVerificationMethod] = useState<
    "bvn" | "nin" | null
  >(null);

  return (
    <div>
      {verificationMethod === null && (
        <div>
          <h2>Choose a verification method</h2>
          <button onClick={() => setVerificationMethod("bvn")}>
            Verify with BVN
          </button>
          <button onClick={() => setVerificationMethod("nin")}>
            Verify with NIN
          </button>
        </div>
      )}
      {verificationMethod === "bvn" && <BvnVerificationForm />}
      {verificationMethod === "nin" && <NinVerificationForm />}
    </div>
  );
};

export default KycWizard;
