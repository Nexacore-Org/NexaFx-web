import { Banknote, ChartSpline, ShieldCheck, Globe } from "lucide-react";

const features = [
  {
    title: "Multi-Currency Support",
    desc: "Convert between NGN, USD, EUR, GBP and crypto",
    icon: Banknote,
  },
  {
    title: "Real-Time Rates",
    desc: "Always get accurate exchange rates instantly",
    icon: ChartSpline,
  },
  {
    title: "Blockchain Security",
    desc: "Secure transactions powered by blockchain",
    icon: ShieldCheck,
  },
  {
    title: "Cross-Border Transfers",
    desc: "Send money globally without restrictions",
    icon: Globe,
  },
];

export default function Features() {
  return (
    <section id="solutions" className="max-w-[1440px] mx-auto px-6 md:px-12 py-24 mb-32">
      <div className="flex flex-col items-center text-center mb-16 max-w-4xl mx-auto">
        <h2 className="hidden md:flex flex-col gap-4 text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
          Redefining the standard of <br />
          <span className="text-[#F39A00]">digital finance</span>
        </h2>
        <h2 className="md:hidden text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
          Redefining the standard of{" "}
          <span className="text-[#F39A00]">digital finance</span>
        </h2>
        <p className="text-slate-600 max-w-2xl">
          We&apos;ve built a platform that combines the speed of modern networks
          with the security of decentralized protocols.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="p-6 rounded-2xl bg-white border hover:shadow-lg transition"
          >
            <div id={f.title.toLowerCase() === "blockchain security" ? "security" : undefined} className="w-fit p-3 rounded-xl bg-amber-50 mb-4">
              <span className="text-[#F39A00]">
                {<f.icon size={30}/>}
              </span>
            </div>
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-slate-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
