"use client";

import { ConversionForm } from "@/components/dashboard/conversion-form";
import { useConversion } from "@/hooks/useConversion";

export default function DashboardPage() {
  // const [activeTab, setActiveTab] = useState("Convert")

  const { conversionState } = useConversion();
  console.log(conversionState === "processing");
  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom_right,_#EFEDED,_#ACB4B7)] flex">
      <div className="flex-1">
        <ConversionForm />
      </div>

      {/* <TokenSelectorModal
        isOpen={showTokenSelector}
        onClose={closeTokenSelector}
        onSelect={selectToken}
        currencies={currencies}
      />

      <ConfirmationModal
        isOpen={conversionState === "confirming"}
        data={conversionData}
        onCancel={cancelConversion}
        onProceed={proceedConversion}
      />
      <ProcessingModal
        isOpen={conversionState === "processing"}
        data={conversionData}
        onCancel={cancelConversion}
      />

      <SuccessModal
        isOpen={conversionState === "success"}
        data={conversionData}
        onClose={closeConversion}
        onViewWallet={viewWallet}
      /> */}
    </div>
  );
}
