/**
 * Google Play reviewer access credentials.
 *
 * Backend MUST accept OTP `REVIEW_OTP` for these phones without sending SMS.
 * Paste the same details into Play Console → App content → App access.
 */
export const REVIEW_OTP = '1234';

/** Pre-seeded Receiver account for Play review. */
export const REVIEW_RECEIVER_PHONE = '+6590000001';

/** Pre-seeded Restaurant account for Play review. */
export const REVIEW_RESTAURANT_PHONE = '+6590000002';

const REVIEW_PHONES = new Set([REVIEW_RECEIVER_PHONE, REVIEW_RESTAURANT_PHONE]);

export function isStoreReviewPhone(phone: string): boolean {
  return REVIEW_PHONES.has(phone.trim());
}

export function isStoreReviewOtp(code: string): boolean {
  return code.trim() === REVIEW_OTP;
}
