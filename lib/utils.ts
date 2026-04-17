import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Indonesian Rupiah currency.
 * Output format: Rp10.000.000,00
 * Uses dot as thousand separator and comma as decimal separator (id-ID locale).
 */
export function formatIDR(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val)
}
/**
 * Format a number as Indonesian Rupiah currency without decimal places.
 * Output format: Rp10.000.000
 */
export function formatIDRCompact(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val)
}
