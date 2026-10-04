/*
 * POST /api/feedback — the Zencus feedback box lands here (Vercel serverless).
 *
 * The browser/app sends { message, email?, context?, website? }. We check it,
 * then email it to the owner through Resend. The API key lives only in Vercel's
 * environment variables, never in the app:
 *   RESEND_API_KEY   (required)  from resend.com
 *   FEEDBACK_TO      (required)  the inbox that should receive feedback
 *   FEEDBACK_FROM    (optional)  defaults to Resend's onboarding sender, which
 *                                can email the address you signed up to Resend with
 *   FEEDBACK_ALLOWED_ORIGINS (optional) extra comma-separated origins
 */
import { allowedOrigin, validateFeedback, buildEmail, rateLimited } from './_feedback.js';

const send = (res, status, body) => res.status(status).json(body);

export default async function handler(req, res) {
  const env = process.env;
  const origin = allowedOrigin(req.headers?.origin, env);

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  if (req.method === 'OPTIONS') return res.status(origin ? 204 : 403).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return send(res, 405, { ok: false, error: 'method_not_allowed' });
  }
  // browsers always send Origin on a cross-site POST: a site we don't know can't use this
  if (req.headers?.origin && !origin) return send(res, 403, { ok: false, error: 'origin_not_allowed' });

  const ip = String(req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) {
    res.setHeader('Retry-After', '600');
    return send(res, 429, { ok: false, error: 'rate_limited' });
  }

  const result = validateFeedback(req.body);
  if (!result.ok) return send(res, 400, { ok: false, error: result.error });
  if (result.spam) return send(res, 200, { ok: true });

  if (!env.RESEND_API_KEY || !env.FEEDBACK_TO) return send(res, 503, { ok: false, error: 'not_configured' });

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 8000);
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(buildEmail(result.value, env)),
      signal: ctl.signal,
    });
    if (!r.ok) {
      // log the status only, never the message or the key
      console.error('feedback: Resend refused', r.status);
      return send(res, 502, { ok: false, error: 'send_failed' });
    }
    return send(res, 200, { ok: true });
  } catch (e) {
    console.error('feedback: send failed', e?.name || 'error');
    return send(res, 502, { ok: false, error: 'send_failed' });
  } finally {
    clearTimeout(timer);
  }
}
