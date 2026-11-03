// Formats a nightly price with its visible currency code, for hotel cards and the summary (U5, U6).

/**
 * Formats an amount as, for example, "NZD 220".
 * @param amount - The price; 220 and 220.0 both render as "220".
 * @param currency - ISO 4217 currency code.
 * @returns The formatted price; it may contain a no-break space after the code.
 */
export function formatPrice(amount: number, currency: string): string {
  // U5: currencyDisplay "code" shows "NZD" rather than the en-NZ default "$", which would hide the currency.
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency,
    currencyDisplay: "code",
    minimumFractionDigits: 0,
  }).format(amount);
}
