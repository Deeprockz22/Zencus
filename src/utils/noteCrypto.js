// PIN-locked notes are stored encrypted: AES-GCM with a key derived from the PIN by
// PBKDF2-SHA-256. A 4-digit PIN can't make this uncrackable, but nobody can read a locked
// note straight out of localStorage any more, and every guess costs a slow key derivation.
const ITERATIONS = 250000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const toBase64 = (bytes) => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
};

const fromBase64 = (text) => {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

async function deriveKey(pin, salt, iterations) {
  const base = await crypto.subtle.importKey('raw', encoder.encode(pin), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export const isLockedNote = (note) => Boolean(note?.cipher || note?.pin);

// A lock lives in memory only while its note is open; the PIN is never stored.
export async function createLock(pin) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { pin, salt, iterations: ITERATIONS, key: await deriveKey(pin, salt, ITERATIONS) };
}

export async function sealText(lock, text) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, lock.key, encoder.encode(text));
  return {
    v: 1,
    salt: toBase64(lock.salt),
    iv: toBase64(iv),
    iterations: lock.iterations,
    data: toBase64(new Uint8Array(data))
  };
}

// { lock, text } for the right PIN, null for a wrong one. Also opens notes saved in the
// old format, which kept the PIN and the text in plain sight.
export async function unlockNote(note, pin) {
  if (note?.cipher) {
    try {
      const salt = fromBase64(note.cipher.salt);
      const key = await deriveKey(pin, salt, note.cipher.iterations);
      const plain = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: fromBase64(note.cipher.iv) },
        key,
        fromBase64(note.cipher.data)
      );
      return { lock: { pin, salt, iterations: note.cipher.iterations, key }, text: decoder.decode(plain) };
    } catch {
      return null;
    }
  }
  if (note?.pin) {
    return pin === note.pin ? { lock: await createLock(pin), text: note.content || '' } : null;
  }
  return null;
}

// Old format -> encrypted, ready to store.
export async function encryptLegacyNote(note) {
  const lock = await createLock(note.pin);
  const cipher = await sealText(lock, note.content || '');
  const { pin: _pin, ...rest } = note;
  return { ...rest, content: '', cipher };
}
