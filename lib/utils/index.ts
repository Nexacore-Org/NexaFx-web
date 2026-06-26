import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDateTime } from './format';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { formatDateTime };
