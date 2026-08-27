import { UserPlus, Wallet, ArrowRightLeft } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Sign Up",
    desc: "Create your account in minutes with email verification.",
    icon: UserPlus,
  },
  {
    step: 2,
    title: "Deposit",
    desc: "Fund your wallet with fiat or crypto from any source.",
    icon: Wallet,
  },
  {
    step: 3,
    title: "Convert & Send",
    desc: "Exchange currencies at real-time rates and send globally.",
    icon: ArrowRightLeft,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="max-w-[1440px] mx-auto px-6 md:px-12 py-24 mb-32"
    >
      <div className="flex flex-col items-center text-center mb-16">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
          How It <span className="text-brand">Works</span>
        </h2>
        <p className="text-slate-600 max-w-2xl">
          Get started in three simple steps.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 relative">
        {steps.map((s, i) => (
          <div key={s.step} className="flex flex-col items-center text-center relative">
            <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center mb-6">
              <s.icon size={28} className="text-primary-foreground" />
            </div>
            <div className="absolute top-0 left-[calc(50%+3rem)] hidden md:block">
              {i < steps.length - 1 && (
                <div className="w-full h-0.5 bg-brand/30" />
              )}
            </div>
            <h3 className="text-xl font-bold mb-2">{s.title}</h3>
            <p className="text-slate-500 max-w-xs">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
