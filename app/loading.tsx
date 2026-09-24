import { Spinner } from "@/components/ui";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Spinner size="lg" className="border-blue-600" />
    </div>
  );
}
