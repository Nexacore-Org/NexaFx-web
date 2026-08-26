"use client";

import { useState, useEffect } from "react";
import { KycIdType, KycStatus, getKycStatus } from "@/lib/api/kyc";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileUploadStep } from "@/components/dashboard/kyc/file-upload-step";
import { ReviewStep } from "@/components/dashboard/kyc/review-step";
import { Loader2 } from "lucide-react";

export default function KycPage() {
  const [step, setStep] = useState(0); // Start at 0 to show loading
  const [idType, setIdType] = useState<KycIdType | null>(null);
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [proofOfAddress, setProofOfAddress] = useState<File | null>(null);
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getKycStatus();
        setKycStatus(status);
        if (status.status === "Not Started") {
          setStep(1);
        }
      } catch (error) {
        console.error("Failed to fetch KYC status", error);
        // Handle error, maybe show a toast
      }
    };
    fetchStatus();
  }, []);

  const handleSuccess = () => {
    setStep(0); // Show loading while refetching status
    const fetchStatus = async () => {
      try {
        const status = await getKycStatus();
        setKycStatus(status);
      } catch (error) {
        console.error("Failed to fetch KYC status", error);
      }
    };
    fetchStatus();
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const renderWizard = () => {
    switch (step) {
      case 0:
        return (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
      case 1:
        return (
          <IdTypeSelectionStep
            idType={idType}
            setIdType={setIdType}
            onContinue={nextStep}
          />
        );
      case 2:
        return (
          <FileUploadStep
            title="Upload Front of Document"
            guideline="Ensure all corners are visible. No glare or shadows."
            onFileSelect={setIdFront}
            onContinue={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        if (idType === "passport") {
          setStep(4);
          return null;
        }
        return (
          <FileUploadStep
            title="Upload Back of Document"
            guideline="Ensure all corners are visible. No glare or shadows."
            onFileSelect={setIdBack}
            onContinue={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <FileUploadStep
            title="Upload Selfie"
            guideline="Hold your ID next to your face. Ensure both are clearly visible."
            onFileSelect={setSelfie}
            onContinue={nextStep}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <FileUploadStep
            title="Upload Proof of Address (Optional)"
            guideline="Upload a utility bill or bank statement dated within 3 months."
            onFileSelect={setProofOfAddress}
            onContinue={nextStep}
            onBack={prevStep}
          />
        );
      case 6:
        return (
          <ReviewStep
            idFront={idFront}
            idBack={idBack}
            selfie={selfie}
            proofOfAddress={proofOfAddress}
            onBack={prevStep}
            onSuccess={handleSuccess}
          />
        );
      default:
        return <div>Unknown Step</div>;
    }
  };

  const renderStatus = () => {
    if (!kycStatus) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    switch (kycStatus.status) {
      case "Verified":
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600">Verified</h2>
            <p>Your identity has been successfully verified.</p>
          </div>
        );
      case "Pending":
      case "Under Review":
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold">Under Review</h2>
            <p>
              Your documents are being reviewed. This usually takes 24-48 hours.
            </p>
          </div>
        );
      case "Rejected":
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Rejected</h2>
            <p className="mb-4">{kycStatus.rejectionReason}</p>
            <Button onClick={() => setStep(1)}>Resubmit</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-2">Verify Your Identity</h1>
      <p className="text-muted-foreground mb-8">
        {kycStatus?.status === "Not Started"
          ? "Please follow the steps to complete your KYC verification."
          : "Check the status of your KYC verification below."}
      </p>
      {kycStatus?.status === "Not Started" ? renderWizard() : renderStatus()}
    </div>
  );
}

interface IdTypeSelectionStepProps {
  idType: KycIdType | null;
  setIdType: (idType: KycIdType) => void;
  onContinue: () => void;
}

function IdTypeSelectionStep({
  idType,
  setIdType,
  onContinue,
}: IdTypeSelectionStepProps) {
  const idTypes: { value: KycIdType; label: string }[] = [
    { value: "national_id", label: "National ID" },
    { value: "passport", label: "Passport" },
    { value: "drivers_license", label: "Driver's License" },
    { value: "voters_card", label: "Voter's Card" },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Step 1: Select Your ID Type
      </h2>
      <RadioGroup
        value={idType ?? ""}
        onValueChange={(value) => setIdType(value as KycIdType)}
        className="space-y-2"
      >
        {idTypes.map((type) => (
          <div
            key={type.value}
            className="flex items-center space-x-2 p-4 border rounded-md"
          >
            <RadioGroupItem value={type.value} id={type.value} />
            <Label htmlFor={type.value} className="flex-grow cursor-pointer">
              {type.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      <Button onClick={onContinue} disabled={!idType} className="mt-6">
        Continue
      </Button>
    </div>
  );
}
