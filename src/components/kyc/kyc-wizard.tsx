import React, { useState } from "react";
import BvnVerificationForm from "./bvn-verification-form";

const KycWizard = () => {
  const [step, setStep] = useState(1);

  return (
    <div>
      {step === 1 && <BvnVerificationForm />}
      {/* The next step (document upload) will be added here */}
    </div>
  );
};

export default KycWizard;
