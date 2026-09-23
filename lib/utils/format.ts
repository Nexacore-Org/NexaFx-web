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
