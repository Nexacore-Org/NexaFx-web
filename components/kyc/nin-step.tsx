"use client";

import { IdentityNumberStep } from "./identity-number-step";

export interface NinStepProps {
  onSuccess: () => void;
  onFallbackToDocuments?: () => void;
  submitFn?: (value: string) => Promise<unknown>;
}

export function NinStep(props: NinStepProps) {
  return <IdentityNumberStep kind="nin" {...props} />;
}
