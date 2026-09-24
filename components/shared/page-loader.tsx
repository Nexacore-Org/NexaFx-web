import { Spinner } from "@/components/ui";

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size="lg" className="border-primary" />
    </div>
  );
}
