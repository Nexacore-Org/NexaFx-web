export function TypeTransaction({ children }: { children: React.ReactNode }) {
  return (
    <button className="gradient-blue-yellow rounded-[8px] w-[93px] h-[28px] p-px">
      <span className="bg-white text-black rounded-[8px] w-full h-full flex items-center justify-center">
        {children}
      </span>
    </button>
  );
}
