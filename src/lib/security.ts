/**
 * Simple SHA-256 hash implementation for strings
 * Uses Web Crypto API when available, falls back to a basic hash if not (though Web Crypto is widely supported now)
 */
const PIN_SALT_KEY = 'sw_pin_salt';

function getPinSalt(): string {
  let salt = localStorage.getItem(PIN_SALT_KEY);
  if (!salt) {
    salt = crypto.randomUUID();
    localStorage.setItem(PIN_SALT_KEY, salt);
  }
  return salt;
}

export async function hashPin(pin: string): Promise<string> {
  const salt = getPinSalt();
  const data = `${salt}:${pin}`;  // salt + pin before hashing
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPinHash(pin: string, hash: string): Promise<boolean> {
  const computed = await hashPin(pin);  // uses same device salt automatically
  if (computed === hash) return true;

  // Fallback: try old unsalted hash for backward compatibility/migration
  const msgUint8 = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const oldHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  if (oldHash === hash) {
    // Optional: We can upgrade the hash to salted in the store in the calling context,
    // but at least verification succeeds without locking the user out.
    return true;
  }
  return false;
}
