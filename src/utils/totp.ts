/**
 * Time-based One-Time Password (TOTP) utility using browser standard Web Crypto API.
 * This is a highly robust, zero-dependency, and secure client-side implementation of RFC 6238.
 */

// Helper to decode Base32 strings into byte arrays
function base32ToBytes(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = base32.toUpperCase().replace(/[\s-]/g, '').replace(/=+$/, '');
  const bytes = new Uint8Array(Math.floor((clean.length * 5) / 8));
  
  let bits = 0;
  let value = 0;
  let index = 0;
  
  for (let i = 0; i < clean.length; i++) {
    const val = alphabet.indexOf(clean[i]);
    if (val === -1) {
      throw new Error('Invalid Base32 character: ' + clean[i]);
    }
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      bytes[index++] = (value >>> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }
  return bytes;
}

/**
 * Generates a TOTP code (6 digits) based on a Base32 secret key.
 * Uses Web Crypto API (SubtleCrypto) to calculate the HMAC-SHA1 hash.
 * 
 * @param secretBase32 The Base32-encoded shared secret
 * @param timeOffsetSteps Optional offset step multiplier (each step is 30 seconds)
 * @returns 6-digit TOTP code
 */
export async function generateTOTP(secretBase32: string, timeOffsetSteps = 0): Promise<string> {
  const secretBytes = base32ToBytes(secretBase32);
  
  // Import raw key bytes for HMAC-SHA1
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  // Calculate standard 30-second epoch counter step
  const counter = Math.floor(Date.now() / 30000) + timeOffsetSteps;
  
  // Create an 8-byte buffer to hold the 64-bit integer counter
  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  counterView.setUint32(0, 0); // High 32-bits (unused for normal epoch time)
  counterView.setUint32(4, counter); // Low 32-bits

  // Sign the counter with the key using HMAC-SHA1
  const signature = await window.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    counterBuffer
  );

  const hmacBytes = new Uint8Array(signature);
  const offset = hmacBytes[hmacBytes.length - 1] & 0xf;
  
  // Dynamic truncation algorithm
  const binary =
    ((hmacBytes[offset] & 0x7f) << 24) |
    ((hmacBytes[offset + 1] & 0xff) << 16) |
    ((hmacBytes[offset + 2] & 0xff) << 8) |
    (hmacBytes[offset + 3] & 0xff);

  let otp = (binary % 1000000).toString();
  while (otp.length < 6) {
    otp = '0' + otp;
  }
  
  return otp;
}

/**
 * Verifies a given TOTP code against a Base32 secret key with clock drift tolerance.
 * 
 * @param secretBase32 The Base32-encoded shared secret
 * @param token The 6-digit code entered by the user
 * @param driftToleranceSteps Number of 30-second steps to tolerate before/after (default is 1 = 30s)
 * @returns Promise<boolean> True if the code matches
 */
export async function verifyTOTP(
  secretBase32: string, 
  token: string, 
  driftToleranceSteps = 1
): Promise<boolean> {
  const cleanToken = token.trim().replace(/\s/g, '');
  if (cleanToken.length !== 6 || isNaN(Number(cleanToken))) {
    return false;
  }
  
  // Test current step and steps within the drift tolerance window
  for (let offset = -driftToleranceSteps; offset <= driftToleranceSteps; offset++) {
    const calculated = await generateTOTP(secretBase32, offset);
    if (calculated === cleanToken) {
      return true;
    }
  }
  return false;
}

/**
 * Generates a random Base32 secret key for authenticator apps (default is 16 characters / 80 bits).
 */
export function generateRandomBase32Secret(length = 16): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += alphabet[randomValues[i] % alphabet.length];
  }
  return result;
}

/**
 * Generates a provisioning URL for QR code generation in Authenticator Apps.
 * Format: otpauth://totp/Issuer:Label?secret=Secret&issuer=Issuer
 */
export function getTOTPProvisioningUri(secret: string, label: string, issuer: string): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedLabel = encodeURIComponent(label);
  return `otpauth://totp/${encodedIssuer}:${encodedLabel}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}
