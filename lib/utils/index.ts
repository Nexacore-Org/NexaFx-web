import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  formatDateTime,
  formatShortDate,
  formatShortDateTime,
  formatDateTimeGB,
} from './format';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { formatDateTime, formatShortDate, formatShortDateTime, formatDateTimeGB };
