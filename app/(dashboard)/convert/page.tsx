import type { Metadata } from "next";
import { ConvertFlow } from "@/components/convert/convert-flow";

export const metadata: Metadata = {
  title: "Convert | NexaFx",
};

export default function ConvertPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Convert</h1>
      <ConvertFlow />
    </main>
  );
}
