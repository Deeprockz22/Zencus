# Feedback box: setup (one time, about 5 minutes)

The feedback box sends each message to a small function on Vercel (`api/feedback.js`),
which emails it to you with [Resend](https://resend.com). Your API key lives only in Vercel's
settings, never in the app or in git.

1. **Make a Resend account** (free: 100 emails a day, 3,000 a month) at resend.com.
   Sign up with the email address where you want to receive feedback.
2. **Create an API key** in Resend (API Keys → Create API Key, "Sending access").
   Copy it once; Resend won't show it again.
3. **Add two settings in Vercel**: Project → Settings → Environment Variables
   (tick Production, and Preview if you want it there too):

   | Name | Value |
   |---|---|
   | `RESEND_API_KEY` | the key you just created |
   | `FEEDBACK_TO` | your email address (the same one you signed up to Resend with) |

   Optional: `FEEDBACK_FROM` (for example `Zencus <feedback@yourdomain.com>`) once you've verified a
   domain in Resend. Until then the default sender, `onboarding@resend.dev`, works, but Resend only lets
   it email the address you signed up with.
4. **Redeploy** (Deployments → the latest → Redeploy) so the settings take effect.

When someone sends feedback you get an email titled `[Zencus] <their first words>`, with the message,
their theme and platform, and, if they gave one, their address. Hitting **Reply** goes straight to them.

**If it isn't set up yet,** the box shows "Feedback isn't switched on yet" instead of failing silently.

**Spam:** a hidden field catches simple bots, each person can send 5 every 10 minutes, and other
websites can't use the endpoint. Resend's daily cap is the final backstop.

**Testing it:** after step 4, open the app on your Vercel site, send a test, and check your inbox
(and spam folder the first time).
