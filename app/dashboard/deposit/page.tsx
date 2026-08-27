"use client";

import InstantModalDeposit from "@/components/dashboard/InstantDepositModal";
import { useRouter } from "next/navigation";

export default function DepositPage() {
  const router = useRouter();
  
  return (
    <div className="max-w-md mx-auto my-8">
      <InstantModalDeposit 
        onClose={() => router.push("/dashboard")} 
        isMobile={false} 
      />
    </div>
  );
}
