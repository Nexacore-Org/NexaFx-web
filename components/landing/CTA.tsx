import Link from "next/link";

export default function CTA() {
  return (
    <section id="exchange" className="max-w-[1440px] mx-auto px-6 md:px-12 mb-20">
      <div className="bg-black text-white rounded-3xl px-8 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to start your financial journey?
        </h2>

        <p className="text-slate-400 mb-10">
          Join thousands using NexaFX for seamless transactions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-[#F39A00] px-8 py-4 rounded-lg font-bold"
          >
            Get Started
          </Link>

          <button className="border border-white/30 px-8 py-4 rounded-lg hover:cursor-pointer transition">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
}