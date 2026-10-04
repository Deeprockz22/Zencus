import { describe, it, expect, vi } from 'vitest';
import { submitFeedback, feedbackEndpoint, feedbackContext, feedbackMessage, PROD_ORIGIN } from './feedback';

const reply = (status, body) => vi.fn().mockResolvedValue({ ok: status < 400, status, json: async () => body });

describe('feedback client', () => {
  it('posts the message, reply address and context as JSON to the function', async () => {
    const fetchImpl = reply(200, { ok: true });
    const r = await submitFeedback({ message: 'hi there', email: 'a@b.co', context: { theme: 'komorebi' } }, { fetchImpl });
    expect(r).toEqual({ ok: true });
    const [url, opts] = fetchImpl.mock.calls[0];
    expect(url).toBe('/api/feedback');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ message: 'hi there', email: 'a@b.co', website: '', context: { theme: 'komorebi' } });
  });

  it('hands back the server’s reason, in words a person can read', async () => {
    const r = await submitFeedback({ message: 'x' }, { fetchImpl: reply(400, { ok: false, error: 'bad_email' }) });
    expect(r).toEqual({ ok: false, error: 'bad_email' });
    expect(feedbackMessage(r.error)).toMatch(/reply address/i);
    expect(feedbackMessage('rate_limited')).toMatch(/little while/i);
    expect(feedbackMessage('not_configured')).toMatch(/isn’t switched on/i);
    expect(feedbackMessage('anything_else')).toMatch(/try again/i);
  });

  it('turns a dead connection or a timeout into "network", and a blank reply into "server"', async () => {
    expect(await submitFeedback({ message: 'x' }, { fetchImpl: vi.fn().mockRejectedValue(new Error('offline')) })).toEqual({ ok: false, error: 'network' });
    const slow = vi.fn((url, { signal }) => new Promise((_, rej) => signal.addEventListener('abort', () => rej(new Error('aborted')))));
    expect(await submitFeedback({ message: 'x' }, { fetchImpl: slow, timeoutMs: 20 })).toEqual({ ok: false, error: 'network' });
    const blank = vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error('no body'); } });
    expect(await submitFeedback({ message: 'x' }, { fetchImpl: blank })).toEqual({ ok: false, error: 'server' });
  });

  it('knows where it is: same origin on the web, the production URL elsewhere', () => {
    expect(feedbackEndpoint()).toBe('/api/feedback');
    expect(PROD_ORIGIN).toBe('https://amify-lyart.vercel.app');
    expect(feedbackContext('surreal')).toEqual({ theme: 'surreal', platform: 'web' });
  });
});
