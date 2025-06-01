export interface Currency {
  code: string;
  name: string;
  icon?: string;
  price?: number;
}

export type ConversionState = "idle" | "confirming" | "processing" | "success";

export interface ConversionData {
  fromAmount: string;
  toAmount: string;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: string;
  fee: string;
}
