import { describe, it, expect } from 'vitest';
import { createLock, sealText, unlockNote, encryptLegacyNote, isLockedNote } from './noteCrypto';

describe('noteCrypto', () => {
  it('round-trips text, and stores neither the text nor the PIN', async () => {
    const lock = await createLock('4821');
    const cipher = await sealText(lock, '<p>my salary is 90k</p>');
    const stored = JSON.stringify(cipher);
    expect(stored).not.toContain('salary');
    expect(stored).not.toContain('4821');
    const opened = await unlockNote({ cipher }, '4821');
    expect(opened.text).toBe('<p>my salary is 90k</p>');
  });

  it('refuses a wrong PIN', async () => {
    const cipher = await sealText(await createLock('4821'), 'secret');
    expect(await unlockNote({ cipher }, '0000')).toBeNull();
  });

  it('handles large notes such as embedded images', async () => {
    const big = `<img src="data:image/png;base64,${'A'.repeat(300000)}">`;
    const lock = await createLock('1111');
    const opened = await unlockNote({ cipher: await sealText(lock, big) }, '1111');
    expect(opened.text).toBe(big);
  });

  it('opens and upgrades notes saved in the old plain-text format', async () => {
    const legacy = { id: 'x', title: 'Old', content: '<p>old secret</p>', pin: '2468' };
    expect(isLockedNote(legacy)).toBe(true);
    expect(await unlockNote(legacy, '1357')).toBeNull();
    expect((await unlockNote(legacy, '2468')).text).toBe('<p>old secret</p>');
    const upgraded = await encryptLegacyNote(legacy);
    expect(upgraded.pin).toBeUndefined();
    expect(upgraded.content).toBe('');
    expect(JSON.stringify(upgraded)).not.toContain('old secret');
    expect((await unlockNote(upgraded, '2468')).text).toBe('<p>old secret</p>');
  });
});
