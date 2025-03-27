import HeroCTA from "./HeroCTA";
import ExchangePreviewCard from "./ExchangePreviewCard";
export default function Hero() {
  return (
    <section className="bg-white py-24 w-full">
      <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12 px-[80px]">
        {/* Left content */}
        <div className="max-w-xl text-center lg:text-left mb-12 lg:mb-0">
          <h1 className="text-[48px] font-bold text-[#0F172A] leading-tight">
            Seamless Currency Exchange <br className="hidden md:block" /> for
            the Digital Age
          </h1>
          <p className="mt-4 text-[16px] text-[#64748B]">
            NexaFX bridges traditional finance and DeFi with real-time exchange
            rates and blockchain security.
          </p>
          <HeroCTA />
        </div>

        {/* Right content */}
        <div className="w-full max-w-md bg-white ">
          <ExchangePreviewCard />
        </div>
      </div>
    </section>
  );
}
