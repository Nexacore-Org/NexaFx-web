/**
 * Safe CSV builder.
 *
 * Defences implemented:
 * - Fields are always double-quoted.
 * - Existing double-quote characters are escaped by doubling them ("").
 * - Embedded newlines (\r, \n) are replaced with a space so one transaction
 *   never spans multiple rows.
 * - Cells that start with =, +, -, @ are prefixed with a single-quote (')
 *   to neutralise spreadsheet formula injection.
 *
 * The output includes a UTF-8 BOM (0xEF 0xBB 0xBF) so Excel and similar
 * applications recognise the encoding and render currency symbols correctly.
 */

export interface CsvColumn<T> {
  /** Header label shown in the first row. */
  header: string;
  /** Extract a raw string value from the row. */
  value: (row: T) => string;
}

// Formula-injection trigger characters defined by OWASP.
const FORMULA_PREFIX_RE = /^[=+\-@]/;

/**
 * Quote and escape a single CSV field value.
 *
 * The result is always wrapped in double-quotes, which means the caller does
 * not need to decide whether quoting is required for a given field.
 */
export function csvField(raw: string): string {
  // Neutralise formula injection: prefix dangerous starters with a single quote.
  let safe = FORMULA_PREFIX_RE.test(raw) ? `'${raw}` : raw;
  // Replace embedded newlines with a space to keep the row on one line.
  safe = safe.replace(/[\r\n]+/g, " ");
  // Escape existing double-quotes by doubling them, then wrap in double-quotes.
  return `"${safe.replace(/"/g, '""')}"`;
}

/**
 * Build a complete CSV string from an array of row objects and column
 * descriptors.
 *
 * @param rows    Array of data objects.
 * @param columns Column definitions (header + value extractor).
 * @returns       UTF-8 BOM + header row + data rows joined by CRLF.
 */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const BOM = "\uFEFF";
  const CRLF = "\r\n";

  const header = columns.map((c) => csvField(c.header)).join(",");
  const dataRows = rows.map((row) =>
    columns.map((c) => csvField(c.value(row))).join(","),
  );

  return BOM + [header, ...dataRows].join(CRLF);
}

// ---------------------------------------------------------------------------
// Filename generation
// ---------------------------------------------------------------------------

export interface CsvFilenameFilters {
  /** ISO-8601 date string or YYYY-MM-DD, inclusive start. */
  dateFrom?: string;
  /** ISO-8601 date string or YYYY-MM-DD, inclusive end. */
  dateTo?: string;
}

/**
 * Generate a descriptive filename for the exported CSV.
 *
 * Examples:
 *   nexafx-transactions-2026-10-01_to_2026-10-31.csv  (date range applied)
 *   nexafx-transactions-2026-10-16.csv                 (exported today, no filter)
 */
export function generateCsvFilename(
  filters: CsvFilenameFilters,
  now: Date = new Date(),
): string {
  const toDateStr = (iso: string): string => iso.slice(0, 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  if (filters.dateFrom && filters.dateTo) {
    return `nexafx-transactions-${toDateStr(filters.dateFrom)}_to_${toDateStr(filters.dateTo)}.csv`;
  }
  if (filters.dateFrom) {
    return `nexafx-transactions-from-${toDateStr(filters.dateFrom)}.csv`;
  }
  if (filters.dateTo) {
    return `nexafx-transactions-to-${toDateStr(filters.dateTo)}.csv`;
  }
  return `nexafx-transactions-${todayStr}.csv`;
}

// ---------------------------------------------------------------------------
// Browser download helper
// ---------------------------------------------------------------------------

/**
 * Trigger a browser file download with the given CSV content.
 *
 * Creates a Blob URL, clicks an invisible anchor, then immediately revokes
 * the URL to avoid memory leaks.
 */
export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    URL.revokeObjectURL(url);
  }
}
