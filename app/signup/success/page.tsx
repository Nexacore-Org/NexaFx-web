import type { Metadata } from "next";
import SuccessClient from "./success-client";

export const metadata: Metadata = {
  title: "Email Confirmed",
};

export default function SuccessPage() {
  return <SuccessClient />;
}
