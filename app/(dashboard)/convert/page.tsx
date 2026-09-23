"use client";

import { ConvertForm } from "@/components/dashboard/convert/convert-form";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { useRouter } from "next/navigation";

export default function ConvertPage() {
  const router = useRouter();

  return (
    <ErrorBoundary onDismiss={() => router.back()} sectionName="Convert">
      <ConvertForm />
    </ErrorBoundary>
  );
}
