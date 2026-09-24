import type { Metadata } from "next";
import LandingPageClient from "./landing-client";

export const metadata: Metadata = {
  title: "NexaFx — Multi-Currency Finance on Stellar",
  description:
    "Convert, deposit, and transfer currencies instantly on the Stellar blockchain.",
  openGraph: {
    title: "NexaFx — Multi-Currency Finance on Stellar",
    description:
      "Convert, deposit, and transfer currencies instantly on the Stellar blockchain.",
  },
};

export default function HomePage() {
  return <LandingPageClient />;
}
