import type { Metadata } from "next";
import LandingPageClient from "./landing-page-client";

export const metadata: Metadata = {
  title: "NexaFx \u2014 Multi-Currency Finance on Stellar",
  description:
    "Convert, deposit, and transfer currencies instantly on the Stellar blockchain.",
  openGraph: {
    title: "NexaFx \u2014 Multi-Currency Finance on Stellar",
    description:
      "Convert, deposit, and transfer currencies instantly on the Stellar blockchain.",
    url: "https://nexafx.io",
  },
};

export default function HomePage() {
  return <LandingPageClient />;
}
