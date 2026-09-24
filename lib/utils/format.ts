// Intl.NumberFormat construction is comparatively expensive and formatCurrency
// is called repeatedly across renders — cache one formatter per
// locale/currency pair and reuse it instead of rebuilding one per call.
const numberFormatCache = new Map<string, Intl.NumberFormat>();

function getNumberFormatter(
  locale: string,
  currency: string,
): Intl.NumberFormat {
  const key = `${locale}|${currency}`;
  let formatter = numberFormatCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    });
    numberFormatCache.set(key, formatter);
  }
  return formatter;
}

export function formatCurrency(amount: number, currency: string): string {
  const upperCurrency = currency.toUpperCase();
  const locale = upperCurrency === "NGN" ? "en-NG" : "en-US";
  return getNumberFormatter(locale, upperCurrency).format(amount);
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZoneName: "short",
  });
}

const SHORT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

const SHORT_DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

const GB_DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

export function formatShortDate(value: string | Date): string {
  return new Date(value).toLocaleDateString("en-US", SHORT_DATE_OPTIONS);
}

export function formatShortDateTime(value: string | Date): string {
  return new Date(value).toLocaleString("en-US", SHORT_DATE_TIME_OPTIONS);
}

export function formatDateTimeGB(value: string | Date): string {
  return new Date(value).toLocaleString("en-GB", GB_DATE_TIME_OPTIONS);
}
