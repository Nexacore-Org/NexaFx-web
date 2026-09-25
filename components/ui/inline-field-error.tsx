"use client";

import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineFieldErrorProps {
  message?: string;
  className?: string;
}

export function InlineFieldError({ message, className }: InlineFieldErrorProps) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className={cn(
        "mt-1.5 ml-1 flex items-center gap-1.5 text-xs text-red-500",
        className,
      )}
    >
      <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}