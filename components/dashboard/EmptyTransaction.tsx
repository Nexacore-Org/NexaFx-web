import { FileX } from "lucide-react";
import { 
  Table, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import Image from "next/image";

export function EmptyTransaction() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Table Header */}
      <Table>
        <TableHeader className="bg-white/60">
          <TableRow className="border-b border-gray-100 hover:bg-transparent">
            {/* Desktop Headers */}
            <TableHead className="text-sm font-bold text-black/50 uppercase tracking-wider py-4 px-6 hidden md:table-cell">
              TYPE
            </TableHead>
            <TableHead className="text-sm font-bold text-black/50 uppercase tracking-wider py-4 px-6 hidden md:table-cell">
              CURRENCY
            </TableHead>
            <TableHead className="text-sm font-bold text-black/50 uppercase tracking-wider py-4 px-6 hidden md:table-cell">
              DATE
            </TableHead>
            <TableHead className="text-sm font-bold text-black/50 uppercase tracking-wider py-4 px-6 hidden md:table-cell">
              STATUS
            </TableHead>
            <TableHead className="text-sm font-bold text-black/50 uppercase tracking-wider py-4 px-6 text-right hidden md:table-cell">
              AMOUNT
            </TableHead>

            {/* Mobile Headers - 3 columns properly aligned */}
            <TableHead className="text-sm font-bold text-black/50 uppercase tracking-wider py-4 px-4 w-1/3 md:hidden">
              TYPE
            </TableHead>
            <TableHead className="text-sm font-bold text-black/50 uppercase tracking-wider py-4 px-4 w-1/3 md:hidden">
              AMOUNT
            </TableHead>
            <TableHead className="text-sm font-bold text-black/50 uppercase tracking-wider py-4 px-4 w-1/3 md:hidden">
              STATUS
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      
      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Image src="/empty-ico.svg" alt="Empty Transaction" width={64} height={64} />
        </div>
        <p className="text-gray-500 text-lg font-medium text-center">No recent Transaction</p>
        <p className="text-gray-400 text-sm text-center mt-2 md:hidden">Your transactions will appear here</p>
      </div>
    </div>
  );
} 