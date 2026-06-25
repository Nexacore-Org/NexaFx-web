export function formatCurrency(amount: number, currency: string): string {
  const upperCurrency = currency.toUpperCase();
  const locale = upperCurrency === "NGN" ? "en-NG" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: upperCurrency,
  }).format(amount);
}
