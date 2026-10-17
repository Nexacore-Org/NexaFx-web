import { z } from "zod";
import { countDecimals, isAmountInput, toUnits } from "@/lib/convert-amount";
import { getCurrency } from "@/lib/currencies";

export interface ConvertValues {
  from: string;
  to: string;
  amount: string;
}

export const DEFAULT_VALUES: ConvertValues = {
  from: "USD",
  to: "NGN",
  amount: "",
};

export const DRAFT_STORAGE_KEY = "nexafx:convert-draft";
const MAX_AMOUNT_LENGTH = 40;

type RawParams =
  | URLSearchParams
  | Record<string, string | string[] | undefined>
  | null
  | undefined;

const codeSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine((code) => getCurrency(code) !== undefined);

function readParam(params: RawParams, key: string): string | undefined {
  if (!params) return undefined;
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const value = params[key];
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "string" ? first : undefined;
}

/** True when any convert key is in the URL, valid or not. */
export function hasConvertParams(params: RawParams): boolean {
  return ["from", "to", "amount"].some(
    (key) => readParam(params, key) !== undefined,
  );
}

/**
 * Validates `from`, `to` and `amount` against the currency registry. Invalid
 * values are dropped silently, so a bad link never breaks the page. The
 * amount is only kept when it is a plain positive decimal that fits the
 * decimals of the currency it will be spent in.
 */
export function parseConvertParams(params: RawParams): Partial<ConvertValues> {
  const result: Partial<ConvertValues> = {};

  const from = codeSchema.safeParse(readParam(params, "from"));
  if (from.success) result.from = from.data;

  const to = codeSchema.safeParse(readParam(params, "to"));
  if (to.success && to.data !== result.from) result.to = to.data;

  const rawAmount = readParam(params, "amount")?.trim();
  if (rawAmount && rawAmount.length <= MAX_AMOUNT_LENGTH) {
    const spendCode = result.from ?? DEFAULT_VALUES.from;
    const decimals = getCurrency(spendCode)?.decimals ?? 0;
    if (
      isAmountInput(rawAmount) &&
      countDecimals(rawAmount) <= decimals &&
      (toUnits(rawAmount, decimals) ?? BigInt(0)) > BigInt(0)
    ) {
      result.amount = rawAmount;
    }
  }

  return result;
}

/** Query string for the current form values (empty amounts are left out). */
export function buildConvertQuery(values: ConvertValues): string {
  const query = new URLSearchParams({ from: values.from, to: values.to });
  const valid = parseConvertParams({
    from: values.from,
    amount: values.amount,
  });
  if (valid.amount) query.set("amount", valid.amount);
  return query.toString();
}

/** Link for places like Market Overview cards that point at a pair. */
export function convertHref(from: string, to: string, amount?: string): string {
  const query = new URLSearchParams({ from, to });
  if (amount) query.set("amount", amount);
  return `/convert?${query.toString()}`;
}

/**
 * Starting values for the form. URL params always win; the stored draft is
 * only used when the URL carries no convert params at all.
 */
export function resolveInitialValues(
  params: RawParams,
  draft: Partial<ConvertValues> | null,
): ConvertValues {
  if (hasConvertParams(params)) {
    return { ...DEFAULT_VALUES, ...parseConvertParams(params) };
  }
  return { ...DEFAULT_VALUES, ...(draft ?? {}) };
}

export function loadDraft(): Partial<ConvertValues> | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    // Stored data is untrusted too: run it through the same validation.
    const draft = parseConvertParams(parsed as Record<string, string>);
    return Object.keys(draft).length > 0 ? draft : null;
  } catch {
    return null;
  }
}

export function saveDraft(values: ConvertValues): void {
  try {
    window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
  } catch {
    // Storage can be blocked or full; the draft is a convenience only.
  }
}
