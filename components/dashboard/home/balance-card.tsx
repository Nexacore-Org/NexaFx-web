import React from "react";

interface BalanceCardProps {
  title: string;
  value: string;
  children?: React.ReactNode;
}

export function BalanceCard({ title, value, children }: BalanceCardProps) {
  return (
    <div className="rounded-[0.392rem] bg-bg-glass-light backdrop-blur-[5.885px] md:bg-bg-balance-card-desktop md:bg-none md:backdrop-blur-[7px] md:rounded-xl p-2">
      <div className="flex flex-col justify-between gap-2 h-full p-0 lg:p-2.5">
        {children ? (
          children
        ) : (
          <>
            <div className="text-black text-[1.3125rem] font-normal leading-[100%] tracking-[0.84px]">
              {title}
            </div>
            <div className="text-black text-[1.5rem] font-semibold leading-[140%]">
              {value}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
