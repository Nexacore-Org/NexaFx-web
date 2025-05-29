import AuthLayout from "@/components/auth/auth-layout";
import SignInForm from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your NexaFX account to continue"
    >
      <SignInForm />
    </AuthLayout>
  );
}
