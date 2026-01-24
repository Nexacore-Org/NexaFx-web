"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    // Redirect after 5 seconds
    const timeout = setTimeout(() => {
      router.push("/");
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 sm:p-20 flex flex-col items-center text-center animate-in fade-in zoom-in duration-700">
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20 scale-150 duration-1000" />
        <CheckCircle2
          size={120}
          className="text-[#22C55E] relative z-10"
          strokeWidth={1.5}
        />
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight mb-4 uppercase">
        EMAIL CONFIRMED
      </h1>

      <div className="space-y-6">
        <p className="text-zinc-500 font-medium max-w-sm mx-auto">
          Your account has been successfully verified. You now have full access
          to NexaFX.
        </p>

        <div className="pt-8">
          <p className="text-sm text-zinc-400 font-mono">
            Redirecting you to dashboard{dots}
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 text-orange-500 font-bold hover:underline"
          >
            Click here if you are not redirected
          </button>
        </div>
      </div>
    </div>
  );
}
