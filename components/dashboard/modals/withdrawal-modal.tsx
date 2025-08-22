import { AlertTriangle, XIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useFormik } from "formik";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";
import { useWithdrawalStore } from "@/store/withdrawalStore";
import { withdrawalValidationSchema } from "@/utils/withdrawalSchema";

interface WithdrawModalData {
  walletAddressOrUsername: string;
  asset: string;
  amount: number;
}

const assets = [
  {
    name: "USDC",
    icon: "/usdc.svg",
  },
  {
    name: "ETH",
    icon: "/eth.svg",
  },
  {
    name: "BNB",
    icon: "/bnb.svg",
  },
];

export default function WithdrawalModal() {
  const { isWithdrawModalOpen, closeWithdrawModal, openSuccessModal } =
    useWithdrawalStore();
  const {
    values,
    handleChange,
    handleSubmit,
    handleBlur,
    isValid,
    setFieldValue,
    touched,
    errors,
    isSubmitting,
  } = useFormik<WithdrawModalData>({
    initialValues: {
      walletAddressOrUsername: "",
      asset: "USDC",
      amount: 0,
    },
    validationSchema: withdrawalValidationSchema,
    validateOnMount: true,
    onSubmit: async (values) => {
      console.log("Submitting...", values);

      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Submission successful");
      closeWithdrawModal();
      openSuccessModal();
    },
  });
  const isMobile = useIsMobile();

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]"
      onClick={() => closeWithdrawModal()}
    >
      <div
        className={cn(
          "bg-[#F5F5F5] md:rounded-2xl w-full max-w-xl mx-auto shadow-2xl px-4 max-sm:fixed bottom-0 max-sm:rounded-t-2xl transition-all duration-300",
          isMobile
            ? isWithdrawModalOpen
              ? "translate-y-0"
              : "translate-y-full"
            : ""
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 md:max-w-md md:mx-auto md:border-b md:border-gray-400 max-sm:flex max-sm:justify-between max-sm:items-center">
          <h2 className="md:text-2xl font-semibold md:text-center">
            Withdraw to another wallet
          </h2>
          <XIcon className="md:hidden" onClick={() => closeWithdrawModal()} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter Wallet address or Username
            </label>
            <input
              type="text"
              name="walletAddressOrUsername"
              value={values.walletAddressOrUsername}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Username or address"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
            />
            {touched.walletAddressOrUsername && (
              <p className="mt-1 text-sm text-red-600">
                {errors.walletAddressOrUsername}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Select Asset to Receive:
            </label>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg bg-blue-50 w-full">
                  <Image
                    src={
                      assets.find((el) => el.name === values.asset)?.icon ?? ""
                    }
                    alt={values.asset}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <span className="font-medium text-gray-900">
                    {values.asset}
                  </span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="bottom"
                align="start"
                className="min-w-[200px] rounded-lg border bg-white shadow-md p-1"
              >
                {assets.map((asset) => (
                  <DropdownMenuItem
                    key={asset.name}
                    onClick={() => setFieldValue("asset", asset.name)}
                    className="flex items-center space-x-3 p-2 cursor-pointer hover:bg-gray-100"
                  >
                    <Image
                      src={asset.icon}
                      alt={asset.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span>{asset.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Enter Amount
            </label>
            <div className="relative">
              <input
                type="text"
                name="amount"
                value={values.amount}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-3 py-7 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              />

              <p className="absolute flex items-center space-x-1 left-3 bottom-3 text-xs">
                <span className="text-gray-500">Balance</span>
                <span className="font-semibold">326,447</span>
              </p>
              <p
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E58600] font-semibold cursor-pointer"
                onClick={() => setFieldValue("amount", "326447")}
              >
                max
              </p>
            </div>
            {touched.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs italic">Reconfirm Wallet address</p>
          </div>

          <div className="p-6 md:space-y-3 max-sm:flex max-sm:items-center max-sm:space-x-3">
            <button
              type="submit"
              disabled={!isValid}
              className={cn(
                "w-full disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg transition-colors cursor-pointer",
                isSubmitting
                  ? "bg-[#F0BB16]/50"
                  : "bg-[#F0BB16] hover:bg-yellow-500"
              )}
            >
              {isSubmitting ? "Processing..." : "Withdraw"}
            </button>
            <button
              type="button"
              onClick={() => closeWithdrawModal()}
              className="w-full hover:bg-gray-200 font-semibold border border-black py-3 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
