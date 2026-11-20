import Link from "next/link";

export function pageHref(
  basePath: string,
  params: Record<string, string | undefined>,
  page: number,
): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key !== "page" && value) qs.set(key, value);
  }
  qs.set("page", String(page));
  return `${basePath}?${qs.toString()}`;
}

const cls = "rounded-md border px-3 py-1.5 text-sm";

export default function AdminPagination({
  basePath,
  params,
  page,
  totalPages,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  totalPages: number;
}) {
  const link = (target: number, label: string, disabled: boolean) =>
    disabled ? (
      <span aria-disabled="true" className={`${cls} cursor-not-allowed opacity-50`}>
        {label}
      </span>
    ) : (
      <Link href={pageHref(basePath, params, target)} className={cls}>
        {label}
      </Link>
    );

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Showing page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        {link(page - 1, "Previous", page <= 1)}
        {link(page + 1, "Next", page >= totalPages)}
      </div>
    </nav>
  );
}
