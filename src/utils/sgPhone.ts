/** Singapore local mobile: 8 digits starting with 6, 8, or 9 (+65 prefix entered separately). */
export const SG_MOBILE_LENGTH = 8;
export const SG_MOBILE_REGEX = /^[689]\d{7}$/;

export function cleanSgPhoneLocal(input: string): string {
  return input.replace(/\D/g, '');
}

export function isValidSgMobile(cleaned: string): boolean {
  return SG_MOBILE_REGEX.test(cleaned);
}

/** Inline validation message for a local SG mobile field (without +65). */
export function getSgMobileError(cleaned: string, showIncomplete = false): string {
  if (cleaned.length === 0) return '';
  if (!/^[689]/.test(cleaned)) return 'Must start with 6, 8 or 9';
  if (cleaned.length < SG_MOBILE_LENGTH) {
    return showIncomplete ? 'Must be exactly 8 digits' : '';
  }
  if (!isValidSgMobile(cleaned)) return 'Enter a valid Singapore number';
  return '';
}

export function toSgE164(cleaned: string): string {
  return `+65${cleaned}`;
}
