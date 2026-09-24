export function formatCurrency(
  amount: string | number | undefined,
  currency: string,
): string {
  if (amount === undefined || amount === null || amount === "") return "";
  const raw =
    typeof amount === "string" ? amount.replace(/[^0-9.-]+/g, "") : String(amount);
  const num = Number(raw);
  if (!Number.isFinite(num)) return String(amount);
  try {
    const locale = currency === "NGN" ? "en-NG" : "en-US";
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
      num,
    );
  } catch {
    return String(amount);
  }
}