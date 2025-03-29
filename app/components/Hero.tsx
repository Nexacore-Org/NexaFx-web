import HeroCTA from "./HeroCTA";
import ExchangePreviewCard from "./ExchangePreviewCard";

export default function Hero() {
  return (
    <section className="bg-white dark:bg-slate-950 py-16 lg:py-24 w-full">
      <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12 px-4 sm:px-10 lg:px-[80px]">
        {/* Left content */}
        <div className="max-w-xl text-left lg:mb-0">
          <h1 className="text-[36px] md:text-[48px] font-bold text-[#0F172A] dark:text-white leading-tight">
            Seamless Currency <br className="hidden md:block" /> Exchange for
            the Digital <br className="hidden md:block" />
            Age
          </h1>
          <p className="mt-4 text-[16px] text-[#64748B] dark:text-slate-400">
            NexaFX bridges traditional finance and DeFi with real-time{" "}
            <br className="hidden md:block" /> exchange rates and blockchain
            security.
          </p>
          <HeroCTA />
        </div>

        {/* Right content */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:mt-0">
          <ExchangePreviewCard />
        </div>
      </div>
    </section>
  );
}
