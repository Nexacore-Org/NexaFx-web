import React from "react";
import { Button } from "@/components/ui/button";

interface ActionButtonProps {
  icon: React.ComponentType<any>;
  label: string;
  variant?: "primary" | "secondary";
}

export function ActionButton({
  icon: Icon,
  label,
  variant = "primary",
}: ActionButtonProps) {
  const isPrimary = variant === "primary";
  const variantClasses = isPrimary
    ? "bg-brand-primary text-black hover:bg-brand-primary-hover"
    : "border-[0.035rem] border-border-glass bg-brand-secondary text-black hover:bg-brand-secondary-hover";

  return (
    <Button
      className={`flex w-[12.346rem] h-[3.175rem] p-[0.565rem] justify-center items-center gap-[0.706rem] rounded-[0.565rem] font-medium text-[1.129rem] leading-[140%] tracking-[0.542px] opacity-90 ${variantClasses}`}
    >
      <Icon className="h-6 w-6" />
      {label}
    </Button>
  );
}
