import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t py-12">
      <div className="max-w-[1440px] px-6 md:px-12 mx-auto flex flex-col md:flex-row justify-between gap-10">
        <div>
          <Image
            src="/logo.png"
            alt="NexaFX Logo"
            width={120}
            height={40}
            className="object-contain mb-4"
          />
          <p className="text-sm text-slate-500 max-w-sm">
            Secure and fast Web3 currency exchange platform.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-20 lg:gap-40 text-sm">
          <div>
            <p className="font-bold mb-4">PLATFORM</p>
            <p className="mb-4 text-gray-500">Exchange</p>
            <p className="mb-4 text-gray-500">Wallet</p>
            <p className="mb-4 text-gray-500">Rates</p>
          </div>

          <div>
            <p className="font-bold mb-4">LEGAL</p>
            <p className="mb-4 text-gray-500">Privacy</p>
            <p className="mb-4 text-gray-500">Terms</p>
            <p className="mb-4 text-gray-500">Security</p>
          </div>

          <div>
            <p className="font-bold mb-4">COMPANY</p>
            <p className="mb-4 text-gray-500">Support</p>
            <p className="mb-4 text-gray-500">About</p>
            <p className="mb-4 text-gray-500">Press</p>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-10">
        © 2024 NexaFX. All rights reserved.
      </p>
    </footer>
  );
}