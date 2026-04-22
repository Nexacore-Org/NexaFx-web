import { cn } from "@/lib/utils";
import { Copy, PencilLine, CircleUserRound } from "lucide-react";
import Image from "next/image";

interface InfoAvatarProps {
  name: string;
  image?: string;
  role?: string;
  walletAddress?: string;
  isVerified?: boolean;
}

export function InfoAvatar({
  name = "cerseiload",
  image,
  role,
  walletAddress = "0xAbc...123",
  isVerified = true,
}: InfoAvatarProps) {
  return (
    <div className="sm:py-8.75 p-3.75 sm:px-5 flex flex-col sm:flex-row items-start justify-between sm:items-center rounded-2xl border-[#E58600] bg-[linear-gradient(83.78deg,rgba(255,162,0,0.3)_-29.73%,rgba(59,130,246,0.3)_143.83%)] border-[0.5px] ">
      <div className="flex flex-col">
        <div className="flex gap-4">
          {image ? (
            <div className="relative w-[70px] h-[68px] rounded-full overflow-hidden">
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <CircleUserRound className="w-[70px] h-[68px] text-muted-foreground" />
          )}
          <div className="flex flex-col justify-between sm:flex-row sm:items-center ">
            <div className="flex flex-col">
              <div className="flex gap-2 items-center">
                <h3 className="font-semibold text-[19px] sm:text-2xl">
                  {name}
                </h3>
                <PencilLine className="size-4 cursor-pointer" />
              </div>
              {role && (
                <span className="text-sm text-muted-foreground">{role}</span>
              )}
            </div>

            <div className="sm:hidden flex gap-2.5 items-center text-[14px] font-medium">
              Wallet address: {walletAddress}
              <Copy className="size-4 cursor-pointer max-sm:size-3" />
            </div>
          </div>
        </div>
        <div className="max-sm:hidden flex gap-2.5 items-center mt-4 text-[14px] font-medium">
          Wallet address: {walletAddress}
          <Copy className="size-4 cursor-pointer max-sm:size-2.5" />
        </div>
      </div>

      <button
        className={cn(
          "max-sm:mt-4 rounded-[35px] border  h-8 sm:h-11 px-7  cursor-pointer text-[14px] font-semibold",
          !isVerified
            ? "border-[#E58600] bg-[#E5860033]"
            : "bg-[#3b82f61a] border-[#3B82F6]",
        )}
      >
        {isVerified ? "Verified ID" : "Unverified ID"}
      </button>
    </div>
  );
}
