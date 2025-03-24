import AuthLayout from "@/components/auth/auth-layout"
import SignUpForm from "@/components/auth/sign-up-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "NexaFX - Create Your Account",
  description: "Join NexaFX to start exchanging currencies with ease",
}

export default function SignUpPage() {
  return (
    <AuthLayout title="Create your account" subtitle="Join NexaFX to start exchanging currencies with ease">
      <SignUpForm />
    </AuthLayout>
  )
}

