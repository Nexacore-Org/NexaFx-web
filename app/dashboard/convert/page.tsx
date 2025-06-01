"use client";

import { ConversionForm } from "@/components/dashboard/conversion-form";
import { TokenSelectorModal } from "@/components/dashboard/modals/token-selector-modal";
import { ConfirmationModal } from "@/components/dashboard/modals/confirmation-modal";
import { ProcessingModal } from "@/components/dashboard/modals/processing-modal";
import { SuccessModal } from "@/components/dashboard/modals/success-modal";
import { useConversion } from "@/hooks/useConversion";

export default function DashboardPage() {
  // const [activeTab, setActiveTab] = useState("Convert")

  const {
    conversionData,
    conversionState,
    showTokenSelector,
    currencies,
    selectToken,
    proceedConversion,
    cancelConversion,
    closeConversion,
    viewWallet,
    closeTokenSelector,
  } = useConversion();
  console.log(conversionState === "processing");
  return (
    <div className="min-h-screen bg-[#EBEBEB] bg-gray-50 flex">
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
