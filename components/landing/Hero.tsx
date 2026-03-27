import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="flex flex-col md:flex-row max-w-360 mx-auto px-6 md:px-12 md:py- gap-12 lg:gap-30 items-center mb-32">
      <div className="w-full md:w-1/2">
        <div className="inline-flex items-center gap-2 bg-[#F39A00]/10 px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-[#F39A00] rounded-full animate-pulse" />
          <span className="text-[#F39A00] text-sm font-semibold uppercase">
            Web3 Evolution is here
          </span>
        </div>

        <h1 className="font-bold text-5xl md:text-7xl mb-6 leading-tight">
          Seamless Crypto & Fiat{" "}
          <span className="text-[#F39A00]">Exchange</span>
          <br />
        </h1>

        <p className="text-lg text-slate-600 font-medium mb-10 max-w-2xl">
          Fast, secure, and fee-free cross-border payments for everyone.
          Experience the next generation of global finance with
          blockchain-backed reliability.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/signup"
            className="bg-[#F39A00] text-white text-center px-8 py-4 rounded-lg font-bold text-lg"
          >
            Sign Up
          </Link>

          <Link
            href="/sign-in"
            className="bg-slate-300/50  text-center px-8 py-4 rounded-lg text-lg font-bold"
          >
            Sign In
          </Link>
        </div>
      </div>

      <div className="w-full md:w-1/2 justify-end flex">
        <div className="bg-white/50 p-4 rounded-4xl shadow-2xl backdrop-blur border">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1PN7qlz34UQ6gDkocfttxjMDcpXhtoow77zY0gKhHDrHSCeoaUHrk1sRH-cthSgBLiJgW15bXQs7Kp2N2n9DTvz5rjfcDWXqeOwZOrzgEUI5bzuUKZbPSIpqQOzC0G6DE61r0rKh4WswW2Sd9PL3Mfxr9Ryyn750VhWoTlntb7URx3s_bpqyk7GWLTpZ4oMHSIa_F4Dbqn9L9ir8ILSPi8uZ6qQdOTkkaoHk13oRdM6IAl02cwmmvjxCtX5Mk8RAQbNPteB0ib4ZS"
            alt="finance visual"
            width={800}
            height={800}
            className="rounded-3xl w-[450px] h-[480px] object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
