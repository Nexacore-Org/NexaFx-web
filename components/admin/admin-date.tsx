"use client";

import { useFormatter } from "next-intl";

/** Formats with next-intl so server and browser agree (timeZone from i18n/request.ts). */
export default function AdminDate({ value, withTime = false }: { value?: string; withTime?: boolean }) {
  const format = useFormatter();
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return <>-</>;
  return (
    <time dateTime={date.toISOString()}>
      {format.dateTime(date, withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" })}
    </time>
  );
}
