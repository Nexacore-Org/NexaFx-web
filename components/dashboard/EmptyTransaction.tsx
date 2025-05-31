import { FileX } from "lucide-react";

export function EmptyTransaction() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Table Header */}
      <div className="border-b border-gray-100 bg-white/60">
        <div className="grid grid-cols-5 gap-4 py-4 px-6">
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            TYPE
          </div>
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            CURRENCY
          </div>
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            DATE
          </div>
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            STATUS
          </div>
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wider text-right">
            AMOUNT
          </div>
        </div>
      </div>
      
      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FileX className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg font-medium">No recent Transaction</p>
      </div>
    </div>
  );
} 