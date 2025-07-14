import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface MobileActionButtonProps {
  icon: string;
  label: string;
  alt: string;
}

export function MobileActionButton({
  icon,
  label,
  alt,
}: MobileActionButtonProps) {
  return (
    <Button
      variant="outline"
      className="flex px-1 h-17 py-2 flex-col items-center gap-1 flex-1 rounded-lg bg-white text-black text-xs font-medium leading-[140%]"
    >
      <div className="h-7 w-7 rounded-2xl bg-bg-icon-container flex items-center justify-center">
        <Image src={icon} alt={alt} width={16} height={16} />
      </div>
      <span>{label}</span>
    </Button>
  );
}
