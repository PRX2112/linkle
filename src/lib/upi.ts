/**
 * UPI URI & Validation Utilities for Linkle Pay
 * Conforms to NPCI UPI Linking Specifications.
 */

// Regular expression to validate standard UPI Virtual Payment Address (VPA)
// Format: username@bank / handle@provider
export const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9]{2,64}$/;

/**
 * Validates whether a given string is a valid UPI ID (VPA).
 */
export function isValidUpiId(upiId: string): boolean {
  if (!upiId || typeof upiId !== "string") return false;
  const trimmed = cleanUpiId(upiId);
  return UPI_ID_REGEX.test(trimmed);
}

/**
 * Cleans up a UPI ID by trimming whitespace and removing any accidental prefix.
 */
export function cleanUpiId(raw: string): string {
  if (!raw) return "";
  let cleaned = raw.trim();
  // Strip uri prefix if a user accidentally pasted a full upi:// link
  if (cleaned.toLowerCase().startsWith("upi://pay?pa=")) {
    const match = cleaned.match(/pa=([^&]+)/);
    if (match && match[1]) {
      cleaned = decodeURIComponent(match[1]);
    }
  }
  return cleaned;
}

export interface UpiUriOptions {
  upiId: string;
  displayName?: string | null;
}

/**
 * Generates a dynamic standard UPI URI without fixed amount.
 * Payer enters whatever amount they wish in their native UPI application.
 * Format: upi://pay?pa={upiId}&pn={displayName}&cu=INR
 */
export function generateUpiUri({ upiId, displayName }: UpiUriOptions): string {
  const cleanId = cleanUpiId(upiId);
  if (!cleanId) return "";

  const name = (displayName && displayName.trim().length > 0) ? displayName.trim() : "Creator";
  const encodedName = encodeURIComponent(name);

  return `upi://pay?pa=${cleanId}&pn=${encodedName}&cu=INR`;
}
