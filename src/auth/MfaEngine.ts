import type { MfaSetupData, RecoveryCode, StoredRecoveryCode } from './types';

// ─── Base32 Encoding ───────────────────────────────────────────────────────────
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  const padLength = (8 - (output.length % 8)) % 8;
  return output + '='.repeat(padLength);
}

function base32Decode(encoded: string): ArrayBuffer {
  const cleaned = encoded.replace(/=+$/, '').toUpperCase();
  const bytes: number[] = [];
  let buffer = 0;
  let bitsLeft = 0;
  for (const char of cleaned) {
    const val = BASE32_ALPHABET.indexOf(char);
    if (val === -1) continue;
    buffer = (buffer << 5) | val;
    bitsLeft += 5;
    if (bitsLeft >= 8) {
      bytes.push((buffer >>> (bitsLeft - 8)) & 0xff);
      bitsLeft -= 8;
    }
  }
  return new Uint8Array(bytes).buffer;
}

// ─── TOTP Implementation (RFC 6238 compliant) ──────────────────────────────────

async function hmacSha1(key: ArrayBuffer, data: ArrayBuffer): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', cryptoKey, data);
}

function truncate(hs: ArrayBuffer): number {
  const bytes = new Uint8Array(hs);
  const offset = bytes[bytes.length - 1] & 0xf;
  const binary =
    ((bytes[offset] & 0x7f) << 24) |
    ((bytes[offset + 1] & 0xff) << 16) |
    ((bytes[offset + 2] & 0xff) << 8) |
    (bytes[offset + 3] & 0xff);
  return binary % 1_000_000;
}

function intToBuffer(value: number): ArrayBuffer {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setBigUint64(0, BigInt(value), false);
  return buf;
}

export async function generateTotpCode(
  secret: ArrayBuffer,
  timestamp = Date.now()
): Promise<string> {
  const counter = Math.floor(timestamp / 30_000);
  const hs = await hmacSha1(secret, intToBuffer(counter));
  const code = truncate(hs);
  return code.toString().padStart(6, '0');
}

export function generateTotpSecret(): { secret: ArrayBuffer; base32: string } {
  const secret = new Uint8Array(20);
  crypto.getRandomValues(secret);
  return { secret: secret.buffer, base32: base32Encode(secret.buffer) };
}

export function generateOtpauthUrl(
  secretBase32: string,
  issuer: string,
  accountName: string
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secretBase32}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

export function parseOtpauthUrl(
  url: string
): { secret: string; issuer: string; account: string } | null {
  try {
    const u = new URL(url);
    if (u.protocol !== 'otpauth:' || u.host !== 'totp') return null;
    const secret = u.searchParams.get('secret') || '';
    const issuer = u.searchParams.get('issuer') || '';
    const account = decodeURIComponent(u.pathname.slice(1)).replace(`${issuer}:`, '');
    return { secret, issuer, account };
  } catch {
    return null;
  }
}

export async function verifyTotpCode(
  secretBase32: string,
  code: string,
  skew = 1
): Promise<boolean> {
  const secret = base32Decode(secretBase32);
  const now = Date.now();
  for (let i = -skew; i <= skew; i++) {
    const candidate = await generateTotpCode(secret, now + i * 30_000);
    if (candidate === code) return true;
  }
  return false;
}

// ─── Recovery Codes ────────────────────────────────────────────────────────────

export function generateRecoveryCodes(count = 10): RecoveryCode[] {
  const codes: RecoveryCode[] = [];
  for (let i = 0; i < count; i++) {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    const code = Array.from(bytes, b => b.toString(36).padStart(2, '0'))
      .join('')
      .toUpperCase()
      .slice(0, 10);
    codes.push({ code, used: false });
  }
  return codes;
}

export async function hashRecoveryCode(code: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code));
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function prepareRecoveryCodesForStorage(
  codes: RecoveryCode[]
): Promise<StoredRecoveryCode[]> {
  return Promise.all(
    codes.map(async code => ({
      hash: await hashRecoveryCode(code.code),
      used: code.used,
    }))
  );
}

export async function verifyRecoveryCode(
  input: string,
  storedCodes: StoredRecoveryCode[]
): Promise<{ valid: boolean; index: number }> {
  const inputHash = await hashRecoveryCode(input.toUpperCase().trim());
  for (let i = 0; i < storedCodes.length; i++) {
    if (!storedCodes[i].used && storedCodes[i].hash === inputHash) {
      return { valid: true, index: i };
    }
  }
  return { valid: false, index: -1 };
}

// ─── MFA Setup ─────────────────────────────────────────────────────────────────

export async function createMfaSetup(
  issuer: string,
  accountName: string
): Promise<MfaSetupData & { codes: RecoveryCode[] }> {
  const { base32 } = generateTotpSecret();
  const otpauthUrl = generateOtpauthUrl(base32, issuer, accountName);
  const codes = generateRecoveryCodes(10);

  return {
    secret: base32,
    otpauthUrl,
    factorId: null,
    codes,
  };
}

// ─── Challenge/Verify Flow ────────────────────────────────────────────────────

export async function createMfaChallenge(factorId: string): Promise<{ id: string }> {
  const { createMfaChallenge: apiCreateChallenge } = await import('@/core/api/supabase');
  const response = await apiCreateChallenge(factorId);
  return { id: response.id };
}

export async function verifyMfaChallenge(
  factorId: string,
  challengeId: string,
  code: string
): Promise<boolean> {
  if (!factorId || !challengeId || !code) return false;
  const { verifyMfaChallenge: apiVerifyChallenge } = await import('@/core/api/supabase');
  return apiVerifyChallenge(factorId, challengeId, code);
}

// Return only the plaintext codes for display (discard after confirmation)
export function getRecoveryCodeStrings(codes: RecoveryCode[]): string[] {
  return codes.map(c => c.code);
}

// ─── Full MFA Setup (with recovery codes) ─────────────────────────────────────
//
// 1. Generates TOTP secret + otpauth URL
// 2. Generates recovery codes
// 3. Returns everything needed for UI: setup data, plaintext codes for modal,
//    and hashed codes for server-side storage
export async function setupMfaWithRecoveryCodes(
  issuer: string,
  accountName: string
): Promise<{
  secret: string;
  otpauthUrl: string;
  factorId: string | null;
  plaintextCodes: string[];
  storedCodes: StoredRecoveryCode[];
}> {
  const setup = await createMfaSetup(issuer, accountName);
  const storedCodes = await prepareRecoveryCodesForStorage(setup.codes);

  return {
    secret: setup.secret,
    otpauthUrl: setup.otpauthUrl,
    factorId: setup.factorId,
    plaintextCodes: getRecoveryCodeStrings(setup.codes),
    storedCodes,
  };
}

// Verify a recovery code during MFA recovery login.
// Expects storedCodes — the hashed/used-flag array persisted server-side.
// Returns the index of the matched (unused) code so the caller can mark it used.
export async function verifyRecoveryCodeForLogin(
  input: string,
  storedCodes: StoredRecoveryCode[]
): Promise<{ valid: boolean; index: number }> {
  return verifyRecoveryCode(input, storedCodes);
}
