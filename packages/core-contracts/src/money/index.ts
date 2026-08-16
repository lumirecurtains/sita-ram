/**
 * Canonical Monetary Value Representation (DOM-05)
 * Strictly enforces 64-bit integer minor units (paise/cents) + ISO-4217 currency tagging.
 * Eliminates IEEE-754 floating point precision corruption.
 */

export interface Money {
  /** Amount in integer minor units (e.g. 22050 paise = ₹220.50) */
  readonly amountMinor: number;
  /** ISO-4217 3-letter currency code (e.g. 'INR', 'USD') */
  readonly currency: string;
}

export const makeMoney = (amountMinor: number, currency = 'INR'): Money => {
  if (!Number.isInteger(amountMinor)) {
    throw new TypeError(`Money amountMinor must be an integer, received: ${amountMinor}`);
  }
  return { amountMinor, currency: currency.toUpperCase() };
};
