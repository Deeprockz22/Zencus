/*
 * Feedback — the client side of the feedback box. submitFeedback() posts to the
 * Vercel function in api/feedback.js, which emails the owner. The box UI calls
 * this and shows feedbackMessage(result.error) when something goes wrong.
 */
import { Capacitor } from '@capacitor/core';

export const PROD_ORIGIN = 'https://amify-lyart.vercel.app';

/** Same origin on Vercel; the full production URL from the iPhone app or GitHub Pages. */
export function feedbackEndpoint() {
  const fromEnv = import.meta.env?.VITE_FEEDBACK_URL;
  if (fromEnv) return fromEnv;
  const host = typeof location !== 'undefined' ? location.hostname : '';
  const elsewhere = Capacitor.isNativePlatform() || host.endsWith('github.io');
  return elsewhere ? `${PROD_ORIGIN}/api/feedback` : '/api/feedback';
}

/** What we tell the server about where this came from (never anything personal). */
export const feedbackContext = (theme) => ({
  theme: theme || '',
  platform: Capacitor.isNativePlatform() ? Capacitor.getPlatform() : 'web',
});

const MESSAGES = {
  message_required: 'Write a few words first.',
  message_too_long: 'That’s a lot, which is lovely. Could you trim it under 2,000 characters?',
  bad_email: 'That reply address doesn’t look right. You can also leave it blank.',
  rate_limited: 'You’ve sent a few already. Please try again in a little while.',
  not_configured: 'Feedback isn’t switched on yet. Thank you for trying.',
  network: 'Couldn’t reach us. Check your connection and try again.',
};
export const feedbackMessage = (error) => MESSAGES[error] || 'Something went wrong on our side. Please try again.';

/**
 * -> { ok: true } | { ok: false, error }  (error is a key of feedbackMessage)
 * `website` is the hidden honeypot field; pass whatever the hidden input holds.
 */
export async function submitFeedback({ message, email = '', website = '', context = {} }, { fetchImpl, timeoutMs = 10000 } = {}) {
  const doFetch = fetchImpl || fetch;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await doFetch(feedbackEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, email, website, context }),
      signal: ctl.signal,
    });
    let data = null;
    try { data = await res.json(); } catch { /* an empty or non-JSON reply */ }
    if (res.ok && data?.ok) return { ok: true };
    return { ok: false, error: data?.error || 'server' };
  } catch {
    return { ok: false, error: 'network' };
  } finally {
    clearTimeout(timer);
  }
}
