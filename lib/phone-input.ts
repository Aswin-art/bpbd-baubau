/**
 * Removes letters and symbols not used in typical phone UI input.
 * Allows: digits, leading +, spaces, hyphens, parentheses, dot (e.g. +62).
 */
export function sanitizePhoneInput(raw: string): string {
  return raw.replace(/[^\d+().\-\s]/g, "");
}

/** Digits only (e.g. year fields). */
export function sanitizeDigitsOnly(raw: string, maxLen?: number): string {
  const d = raw.replace(/\D/g, "");
  return maxLen != null ? d.slice(0, maxLen) : d;
}
