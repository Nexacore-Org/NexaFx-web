"use client";

import { IdentityNumberStep } from "./identity-number-step";

export interface BvnStepProps {
  onSuccess: () => void;
  onFallbackToDocuments?: () => void;
  submitFn?: (value: string) => Promise<unknown>;
}

export function BvnStep(props: BvnStepProps) {
  return <IdentityNumberStep kind="bvn" {...props} />;
}
