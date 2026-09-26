"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { initiateKyc, uploadKycDocument, submitKyc } from "@/lib/api/kyc";
import { Loader2 } from "lucide-react";

interface ReviewStepProps {
  idFront: File | null;
  idBack: File | null;
  selfie: File | null;
  proofOfAddress: File | null;
  onBack: () => void;
  onSuccess: () => void;
}

export function ReviewStep({
  idFront,
  idBack,
  selfie,
  proofOfAddress,
  onBack,
  onSuccess,
}: ReviewStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { submissionId } = await initiateKyc();

      const uploads: { type: any; file: File | null }[] = [
        { type: "id_front", file: idFront },
        { type: "id_back", file: idBack },
        { type: "selfie", file: selfie },
        { type: "proof_of_address", file: proofOfAddress },
      ];

      for (const upload of uploads) {
        if (upload.file) {
          await uploadKycDocument(submissionId, upload.type, upload.file);
        }
      }

      await submitKyc(submissionId);

      toast({
        title: "Submission successful",
        description: "Your documents have been submitted for review.",
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "An error occurred while submitting your documents.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFilePreview = (file: File | null, name: string) => {
    if (!file) return null;
    return (
      <div className="border p-2 rounded-md">
        <p className="font-semibold text-sm">{name}</p>
        <p className="text-xs text-muted-foreground">{file.name}</p>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Step 6: Review and Submit</h2>
      <div className="space-y-4">
        {renderFilePreview(idFront, "Front of ID")}
        {renderFilePreview(idBack, "Back of ID")}
        {renderFilePreview(selfie, "Selfie")}
        {renderFilePreview(proofOfAddress, "Proof of Address")}
      </div>

      <p className="text-sm text-muted-foreground mt-6">
        Our team will review your submission within 24–48 hours.
      </p>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit for verification
        </Button>
      </div>
    </div>
  );
}
