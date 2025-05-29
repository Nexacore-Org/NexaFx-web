"use client";

import AuthLayout from "@/components/auth/auth-layout";
import SignUpForm from "@/components/auth/sign-up-form";
import SignUpFormSkeleton from "@/components/ui/sign-up-form-skeleton";
import { useEffect, useState } from "react";

export default function SignUpPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading ? (
        <SignUpFormSkeleton />
      ) : (
        <AuthLayout
          title="Create your account"
          subtitle="Join NexaFX to start exchanging currencies with ease"
        >
          <SignUpForm />
        </AuthLayout>
      )}
    </>
  );
}
