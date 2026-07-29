import type { Metadata } from "next";
import ForgotPasswordPageClient from "./forgot-password-client";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageClient />;
}
