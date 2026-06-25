import type { Metadata } from "next";
import SignInClient from "./sign-in-client";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignInPage() {
  return <SignInClient />;
}
