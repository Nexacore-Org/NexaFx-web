import type { Metadata } from "next";
import VerifyOtpClient from "./verify-otp-client";

export const metadata: Metadata = {
  title: "Verify OTP",
};

export default function VerifyOtpPage() {
  return <VerifyOtpClient />;
}
