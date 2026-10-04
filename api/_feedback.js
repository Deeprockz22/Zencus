/*
 * Feedback — the pure parts of POST /api/feedback (validation, CORS, rate limit,
 * the email itself). Kept apart from the handler so they can be tested without a
 * server. The leading underscore keeps Vercel from exposing this file as a route.
 */

export const LIMITS = { message: { min: 3, max: 2000 }, email: 200, field: 40 };

// Where the box may be used from: the production site, its preview deployments,
// GitHub Pages, the iPhone app (Capacitor's origin), and local dev.
const FIXED_ORIGINS = [
  'https://amify-lyart.vercel.app',
  'https://deeprockz22.github.io',
  'capacitor://localhost',
  'ionic://localhost',
  'https://localhost',
  'http://localhost:5173',
  'http://localhost:3401',
];
const PREVIEW = /^https:\/\/amify-lyart[a-z0-9-]*\.vercel\.app$/;

export function allowedOrigin(origin, env = {}) {
  if (!origin) return null;
  const extra = String(env.FEEDBACK_ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  return FIXED_ORIGINS.includes(origin) || extra.includes(origin) || PREVIEW.test(origin) ? origin : null;
}

// strip control characters (keep newline and tab) so nothing odd reaches the inbox
const clean = (s) => String(s).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u2028\u2029]/g, ' ');
const tag = (s) => clean(s).replace(/[^A-Za-z0-9 ._-]/g, '').trim().slice(0, LIMITS.field);
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

/** -> { ok:true, value } | { ok:false, error } | { ok:true, spam:true } */
export function validateFeedback(raw) {
  let body = raw;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return { ok: false, error: 'bad_json' }; }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, error: 'bad_json' };

  // a field real people never see: bots fill it in. Say "thanks" and send nothing.
  if (typeof body.website === 'string' && body.website.trim()) return { ok: true, spam: true };

  if (typeof body.message !== 'string') return { ok: false, error: 'message_required' };
  const message = clean(body.message).trim();
  if (message.length < LIMITS.message.min) return { ok: false, error: 'message_required' };
  if (message.length > LIMITS.message.max) return { ok: false, error: 'message_too_long' };

  let email = '';
  if (body.email != null && String(body.email).trim() !== '') {
    email = String(body.email).trim();
    if (email.length > LIMITS.email || !EMAIL.test(email)) return { ok: false, error: 'bad_email' };
  }

  const ctx = body.context && typeof body.context === 'object' ? body.context : {};
  return {
    ok: true,
    value: { message, email, context: { theme: tag(ctx.theme || ''), platform: tag(ctx.platform || ''), app: tag(ctx.app || '') } },
  };
}

/** The email Resend sends to the owner. The subject is one sanitised line (no header injection). */
export function buildEmail({ message, email, context }, env, now = new Date()) {
  const first = message.split('\n')[0].replace(/\s+/g, ' ').trim();
  const subject = `[Zencus] ${first.length > 60 ? `${first.slice(0, 57)}...` : first}`;
  const lines = [
    message,
    '',
    '--',
    `From: ${email || 'anonymous (no reply address)'}`,
    `Theme: ${context.theme || 'unknown'}   Platform: ${context.platform || 'unknown'}   App: ${context.app || 'unknown'}`,
    `Sent: ${now.toISOString()}`,
  ];
  const mail = {
    from: env.FEEDBACK_FROM || 'Zencus Feedback <onboarding@resend.dev>',
    to: [env.FEEDBACK_TO],
    subject,
    text: lines.join('\n'),
  };
  if (email) mail.reply_to = email; // hitting Reply in your inbox goes straight to them
  return mail;
}

/* A small, honest limiter. Serverless instances come and go, so this is a
   speed-bump against a runaway script, not a guarantee: Resend's own daily
   cap is the hard stop. */
const hits = new Map();
const WINDOW_MS = 10 * 60 * 1000;
export const RATE = { perIp: 5, perInstance: 60 };

export function rateLimited(ip, now = Date.now()) {
  const keep = (list) => list.filter((t) => now - t < WINDOW_MS);
  const mine = keep(hits.get(ip) || []);
  let total = 0;
  for (const [k, list] of hits) {
    const kept = k === ip ? mine : keep(list);
    if (!kept.length && k !== ip) hits.delete(k);
    else total += kept.length;
  }
  if (mine.length >= RATE.perIp || total >= RATE.perInstance) return true;
  mine.push(now);
  hits.set(ip, mine);
  return false;
}
export const _resetRateLimit = () => hits.clear();
