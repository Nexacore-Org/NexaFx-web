import HeroCTA from "./HeroCTA";
import ExchangePreviewCard from "./ExchangePreviewCard";

export default function Hero() {
  return (
    <section className="bg-white dark:bg-slate-950 py-16 lg:py-24 w-full container mx-auto">
      <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12 px-4 sm:px-10 lg:px-[80px]">
        {/* Left content */}
        <div className="max-w-2xl lg:mb-0 space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
            Seamless Currency Exchange for the Digital Age
          </h1>
          <p className="max-w-[600px] text-muted-foreground md:text-xl mt-3">
            NexaFX bridges traditional finance and DeFi with real-time exchange
            rates and blockchain security.
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
