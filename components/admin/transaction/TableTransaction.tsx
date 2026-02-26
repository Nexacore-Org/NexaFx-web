import { mockAdminTransactions } from "@/lib/admin-mock-data";
import { TypeTransaction } from "./TypeTransaction";

export function TableTransaction() {
  return (
    <div>
      <table className="rounded-t-2xl bg-white w-full text-left " role="table">
        <thead className="font-bold text-[12px] ">
          <tr className="border border-transparent border-b-[#00000033]">
            <th className="py-4 pl-8 hidden sm:table-cell">
              <span className="inline-block rounded-full size-2.5 bg-black mr-3" />
              Amount
            </th>
            <th className="py-4 hidden sm:table-cell">Type</th>
            <th className="py-4">
              <span className="inline-block ml-8 sm:hidden rounded-full size-2.5 bg-black mr-3" />
              Username
            </th>
            <th className="py-4 hidden sm:table-cell">Date</th>
            <th className="py-4">Transaction ID</th>
            <th className="py-4 sm:hidden">TYpe</th>
          </tr>
        </thead>
        <tbody>
          {mockAdminTransactions.map((item) => (
            <tr key={item.id} className="text-[14px] font-medium ">
              <td className="hidden sm:table-cell font-semibold pl-8 py-5 border border-transparent border-b-[#00000033]">
                <span className="inline-block rounded-full size-2.5 bg-[#66FF47] mr-3" />
                {item.currency}
                <span className="pl-1">{item.amount}</span>
              </td>
              <td className="hidden sm:table-cell py-5 border border-transparent border-b-[#00000033]">
                <TypeTransaction>{item.type}</TypeTransaction>
              </td>
              <td className="py-5 border border-transparent border-b-[#00000033]">
                <span className="ml-8 sm:hidden inline-block rounded-full size-2.5 bg-[#66FF47] mr-3" />
                {item.username}
              </td>
              <td className="hidden sm:table-cell py-5 border border-transparent border-b-[#00000033]">
                {item.date}
              </td>
              <td className="py-5 border border-transparent border-b-[#00000033]">
                {item.txId}
              </td>
              <td className="sm:hidden  py-5 border border-transparent border-b-[#00000033]">
                <TypeTransaction>{item.type}</TypeTransaction>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
