import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handler from './feedback.js';
import { validateFeedback, buildEmail, allowedOrigin, rateLimited, _resetRateLimit, RATE } from './_feedback.js';

const ENV = { RESEND_API_KEY: 're_test_key', FEEDBACK_TO: 'owner@example.com' };
const ORIGIN = 'https://amify-lyart.vercel.app';

const mockRes = () => {
  const r = { statusCode: 200, headers: {}, body: undefined, ended: false };
  r.setHeader = (k, v) => { r.headers[k] = v; return r; };
  r.status = (c) => { r.statusCode = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  r.end = () => { r.ended = true; return r; };
  return r;
};
const post = (body, { origin = ORIGIN, ip = '1.2.3.4', method = 'POST' } = {}) => ({
  method, body, headers: { origin, 'x-forwarded-for': ip },
});

describe('validateFeedback', () => {
  it('accepts a plain message, trims it, and keeps only safe context tags', () => {
    const r = validateFeedback({ message: '  Love the cat.  ', context: { theme: 'komorebi', platform: 'ios', app: '1.0<script>' } });
    expect(r.ok).toBe(true);
    expect(r.value).toEqual({ message: 'Love the cat.', email: '', context: { theme: 'komorebi', platform: 'ios', app: '1.0script' } });
  });
  it('accepts a JSON string body (some clients send it raw)', () => {
    expect(validateFeedback('{"message":"hello there"}').ok).toBe(true);
    expect(validateFeedback('{nope').error).toBe('bad_json');
  });
  it('requires a real message, within limits', () => {
    expect(validateFeedback({}).error).toBe('message_required');
    expect(validateFeedback({ message: 'a' }).error).toBe('message_required');
    expect(validateFeedback({ message: 42 }).error).toBe('message_required');
    expect(validateFeedback({ message: 'x'.repeat(2001) }).error).toBe('message_too_long');
    expect(validateFeedback({ message: 'x'.repeat(2000) }).ok).toBe(true);
  });
  it('treats the reply address as optional, but rejects a malformed one', () => {
    expect(validateFeedback({ message: 'hello', email: '' }).value.email).toBe('');
    expect(validateFeedback({ message: 'hello', email: 'me@site.com' }).value.email).toBe('me@site.com');
    expect(validateFeedback({ message: 'hello', email: 'not-an-email' }).error).toBe('bad_email');
  });
  it('flags the hidden honeypot field as spam', () => {
    expect(validateFeedback({ message: 'buy now', website: 'http://spam' }).spam).toBe(true);
  });
  it('normalises line endings and strips control characters', () => {
    expect(validateFeedback({ message: 'one\r\ntwo\u0007!' }).value.message).toBe('one\ntwo !');
  });
});

describe('buildEmail', () => {
  const value = { message: 'First line\nsecond line', email: 'me@site.com', context: { theme: 'surreal', platform: 'web', app: '' } };
  it('puts the message and where it came from in the body, and sets reply-to', () => {
    const m = buildEmail(value, ENV, new Date('2026-10-04T10:00:00Z'));
    expect(m.to).toEqual(['owner@example.com']);
    expect(m.subject).toBe('[Zencus] First line');
    expect(m.reply_to).toBe('me@site.com');
    expect(m.text).toContain('second line');
    expect(m.text).toContain('Theme: surreal');
    expect(m.text).toContain('2026-10-04T10:00:00.000Z');
  });
  it('is fine with no reply address, and uses a custom sender when set', () => {
    const m = buildEmail({ ...value, email: '' }, { ...ENV, FEEDBACK_FROM: 'Zencus <hi@zencus.app>' });
    expect(m.reply_to).toBeUndefined();
    expect(m.from).toBe('Zencus <hi@zencus.app>');
    expect(m.text).toContain('anonymous');
  });
  it('keeps the subject to one short line (no header injection)', () => {
    const m = buildEmail({ ...value, message: `${'a'.repeat(100)}\nBcc: x@evil.com` }, ENV);
    expect(m.subject.includes('\n')).toBe(false);
    expect(m.subject.length).toBeLessThanOrEqual(70);
  });
});

describe('allowedOrigin', () => {
  it('allows the site, previews, GitHub Pages, the iPhone app and local dev', () => {
    for (const o of [ORIGIN, 'https://amify-lyart-git-main-x.vercel.app', 'https://deeprockz22.github.io', 'capacitor://localhost', 'http://localhost:3401']) {
      expect(allowedOrigin(o)).toBe(o);
    }
  });
  it('refuses anyone else, and honours FEEDBACK_ALLOWED_ORIGINS', () => {
    expect(allowedOrigin('https://evil.example')).toBeNull();
    expect(allowedOrigin('https://amify-lyart.vercel.app.evil.example')).toBeNull();
    expect(allowedOrigin(undefined)).toBeNull();
    expect(allowedOrigin('https://my.domain', { FEEDBACK_ALLOWED_ORIGINS: 'https://my.domain, https://b.com' })).toBe('https://my.domain');
  });
});

describe('rateLimited', () => {
  beforeEach(_resetRateLimit);
  it('lets a person send a few, then asks them to wait', () => {
    for (let i = 0; i < RATE.perIp; i += 1) expect(rateLimited('9.9.9.9', 1000)).toBe(false);
    expect(rateLimited('9.9.9.9', 1000)).toBe(true);
    expect(rateLimited('8.8.8.8', 1000)).toBe(false);       // someone else is unaffected
    expect(rateLimited('9.9.9.9', 1000 + 10 * 60 * 1000 + 1)).toBe(false); // window passed
  });
});

describe('POST /api/feedback', () => {
  const realFetch = global.fetch;
  const realEnv = { ...process.env };
  let fetchMock;
  beforeEach(() => {
    _resetRateLimit();
    Object.assign(process.env, ENV);
    fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    global.fetch = fetchMock;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => { global.fetch = realFetch; process.env = { ...realEnv }; vi.restoreAllMocks(); });

  it('emails the owner and says ok, with CORS for the app', async () => {
    const res = mockRes();
    await handler(post({ message: 'The sunset is lovely', email: 'a@b.co', context: { theme: 'surreal' } }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(opts.headers.Authorization).toBe('Bearer re_test_key');
    const sent = JSON.parse(opts.body);
    expect(sent.to).toEqual(['owner@example.com']);
    expect(sent.reply_to).toBe('a@b.co');
    expect(sent.text).toContain('The sunset is lovely');
  });

  it('answers the browser preflight, and refuses strangers', async () => {
    const pre = mockRes();
    await handler(post(undefined, { method: 'OPTIONS', origin: 'capacitor://localhost' }), pre);
    expect(pre.statusCode).toBe(204);
    expect(pre.headers['Access-Control-Allow-Methods']).toContain('POST');
    const bad = mockRes();
    await handler(post({ message: 'hello there' }, { origin: 'https://evil.example' }), bad);
    expect(bad.statusCode).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('only accepts POST', async () => {
    const res = mockRes();
    await handler(post(undefined, { method: 'GET' }), res);
    expect(res.statusCode).toBe(405);
  });

  it('rejects bad input without sending anything', async () => {
    const res = mockRes();
    await handler(post({ message: '' }), res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('message_required');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('quietly drops bots (honeypot) with a friendly 200 and no email', async () => {
    const res = mockRes();
    await handler(post({ message: 'cheap pills here', website: 'x.com' }), res);
    expect(res.statusCode).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('slows a flood', async () => {
    let last;
    for (let i = 0; i <= RATE.perIp; i += 1) { last = mockRes(); await handler(post({ message: `message ${i}!` }), last); }
    expect(last.statusCode).toBe(429);
    expect(fetchMock).toHaveBeenCalledTimes(RATE.perIp);
  });

  it('says so plainly when email is not set up yet', async () => {
    delete process.env.RESEND_API_KEY;
    const res = mockRes();
    await handler(post({ message: 'anyone there?' }), res);
    expect(res.statusCode).toBe(503);
    expect(res.body.error).toBe('not_configured');
  });

  it('reports a failed send as a 502, never leaking the key or the message into logs', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 422 });
    const res = mockRes();
    await handler(post({ message: 'a very private thought' }), res);
    expect(res.statusCode).toBe(502);
    const logged = JSON.stringify(console.error.mock.calls);
    expect(logged).not.toContain('re_test_key');
    expect(logged).not.toContain('private thought');
  });
});
