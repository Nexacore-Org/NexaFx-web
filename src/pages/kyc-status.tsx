import React from "react";

const KycStatusPage = () => {
  // In a real application, this data would come from an API
  const kycStatus = {
    bvn: "Verified",
    documents: "Pending",
  };

  return (
    <div>
      <h1>KYC Status</h1>
      <p>BVN: {kycStatus.bvn}</p>
      <p>Documents: {kycStatus.documents}</p>
    </div>
  );
};

export default KycStatusPage;
