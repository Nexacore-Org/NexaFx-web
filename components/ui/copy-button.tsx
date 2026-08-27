"use client";

import { Check, Copy } from "lucide-react";
import { useClipboard } from "@/hooks/use-clipboard";
import { showToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function CopyButton({
  value,
  label = "Copy to clipboard",
  size = "md",
  className,
}: CopyButtonProps) {
  const { copy, copied } = useClipboard(2000);

  const handleCopy = async () => {
    const success = await copy(value);

    if (!success) {
      showToast("Failed to copy");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? `${label} - copied` : label}
      role="button"
      title={copied ? "Copied" : label}
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground",
        "transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2",
        size === "sm" ? "size-8" : "size-9",
        copied && "border-green-500/30 bg-green-500/10 text-green-600 hover:bg-green-500/15 hover:text-green-600",
        className,
      )}
    >
      {copied ? <Check className={size === "sm" ? "size-4" : "size-5"} /> : <Copy className={size === "sm" ? "size-4" : "size-5"} />}
    </button>
  );
}
