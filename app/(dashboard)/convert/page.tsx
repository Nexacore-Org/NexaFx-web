import { Suspense } from "react";
import type { Metadata } from "next";
import { ConvertFlow } from "@/components/convert/convert-flow";
import { hasConvertParams, parseConvertParams } from "@/lib/convert-params";

export const metadata: Metadata = {
  title: "Convert | NexaFx",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// In this Next.js version searchParams is a Promise (see
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md).
// next.config.ts enables cacheComponents, so reading it has to happen under a
// Suspense boundary or the route fails to prerender.
async function ConvertFromParams({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  return (
    <ConvertFlow
      defaultValues={parseConvertParams(params)}
      hasUrlParams={hasConvertParams(params)}
    />
  );
}

export default function ConvertPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Convert</h1>
      <Suspense
        fallback={
          <div
            aria-busy="true"
            className="h-96 w-full animate-pulse rounded-md bg-gray-200"
          />
        }
      >
        <ConvertFromParams searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
