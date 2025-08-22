import { useWithdrawalStore } from "@/store/withdrawalStore";
import Image from "next/image";

export default function WithdrawalSuccessModal() {
  const { closeSuccessModal } = useWithdrawalStore();
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={closeSuccessModal}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md mx-auto shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col justify-center items-center bg-gradient-to-br from-[#FFE79C]/70 from-20% to-[#A0C3FD]/70 to-80% px-6 py-5 text-center w-[90%] mx-auto mt-5 rounded-xl">
          <Image src="/green-tick.svg" alt="Success" width={50} height={50} />

          <h2 className="text-lg font-medium text-gray-700 mb-6">
            Withdrawal Successful
          </h2>

          <div className="text-3xl font-bold text-gray-900">
            -100,000
            <span className="text-xl font-medium text-gray-600">NGN</span>
          </div>
        </div>

        <div className="p-6 flex space-x-3">
          <button className="flex-1 bg-[#F3C740] font-medium py-3 rounded-lg transition-colors">
            View details
          </button>
          <button
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors border border-gray-200"
            onClick={closeSuccessModal}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
