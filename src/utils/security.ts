/**
 * Simple SHA-256 hash implementation for strings
 * Uses Web Crypto API when available, falls back to a basic hash if not (though Web Crypto is widely supported now)
 */
export async function hashPin(pin: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Checks if a PIN matches a stored hash
 */
export async function verifyPinHash(pin: string, hash: string): Promise<boolean> {
  const hashed = await hashPin(pin);
  return hashed === hash;
}
