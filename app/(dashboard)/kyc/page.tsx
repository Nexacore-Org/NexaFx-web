"use client";

import { useState } from "react";
import { KycIdType } from "@/lib/api/kyc";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Placeholder components for the other steps
const UploadStep = ({ title }: { title: string }) => <div>{title}</div>;
const ReviewStep = () => <div>Review Step</div>;

export default function KycPage() {
  const [step, setStep] = useState(1);
  const [idType, setIdType] = useState<KycIdType | null>(null);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <IdTypeSelectionStep
            idType={idType}
            setIdType={setIdType}
            onContinue={nextStep}
          />
        );
      case 2:
        return <UploadStep title="Upload Front of Document" />;
      case 3:
        return <UploadStep title="Upload Back of Document" />;
      case 4:
        return <UploadStep title="Upload Selfie" />;
      case 5:
        return <UploadStep title="Upload Proof of Address" />;
      case 6:
        return <ReviewStep />;
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-2">Verify Your Identity</h1>
      <p className="text-muted-foreground mb-8">
        Please follow the steps to complete your KYC verification.
      </p>
      {renderStep()}
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
