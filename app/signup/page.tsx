import type { Metadata } from "next";
import SignupClient from "./signup-client";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function SignupPage() {
  return <SignupClient />;
}
