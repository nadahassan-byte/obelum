// POST /api/send — the site's forms send here, on the site's own address.
//
// Visitors' browsers could not reach formsubmit.co ("site can't be reached"),
// so the browser no longer talks to it at all. This function runs on Vercel's
// servers and hands the message to FormSubmit from there, which emails it to
// INBOX. FormSubmit still needs its one-time "Activate Form" link clicking in
// that inbox before anything is delivered.
//
// Plain CommonJS with no dependencies: Vercel deploys any file in /api as a
// Node function, even on a static site with no package.json.

const INBOX = 'oobelumgroup@gmail.com';
const UPSTREAM = 'https://formsubmit.co/ajax/' + INBOX;

// Only these fields are passed on, per form, so the endpoint cannot be used to
// send arbitrary content. Values are trimmed and capped.
const FIELDS = {
  contact: ['name', 'email', 'phone', 'about', 'message'],
  brief: ['Looking to', 'name', 'email', 'phone', 'community'],
  signup: ['email'],
};
const MAX = { message: 2000 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,24}$/;

const clean = (v, key) => String(v == null ? '' : v).trim().slice(0, MAX[key] || 200);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Use POST.' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  const kind = body._form;
  const keys = FIELDS[kind];
  if (!keys) return res.status(400).json({ success: false, message: 'Unknown form.' });

  // Honeypot: people never see this field, bots fill it. Pretend it worked.
  if (body._honey) return res.status(200).json({ success: true });

  const fields = {};
  keys.forEach((k) => { fields[k] = clean(body[k], k); });
  if (!EMAIL.test(fields.email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email.' });
  }

  // The page the visitor sent it from, for FormSubmit's records.
  const site = (req.headers.origin || ('https://' + (req.headers.host || 'obelum.ae'))).replace(/\/$/, '');
  const referer = req.headers.referer || site + '/';

  try {
    const r = await fetch(UPSTREAM, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Origin: site,
        Referer: referer,
      },
      body: JSON.stringify(Object.assign({}, fields, {
        _subject: clean(body._subject, '_subject') || 'Website form',
        _template: 'table',
        _captcha: 'false',
        _replyto: fields.email,
      })),
    });
    const text = await r.text();
    let data = null;
    try { data = JSON.parse(text); } catch (e) { data = null; }

    const ok = r.ok && data && String(data.success) === 'true';
    // The whole upstream body goes to the log, never to the visitor.
    if (!ok) console.error('FormSubmit refused', r.status, text.slice(0, 500));

    // A non-JSON reply means a challenge page, an outage or a redirect — not
    // something a visitor can act on, and never something to put on screen.
    // Passing `text` through as `message` is how a Cloudflare interstitial
    // ended up printed inside the form.
    let message;
    if (ok) {
      message = 'Sent.';
    } else if (!data) {
      message = 'The email service is not accepting messages from the site at the moment.';
    } else if (/activat/i.test(data.message || '')) {
      // FormSubmit holds everything until its one-time link is clicked.
      message = 'The email service still needs its activation link confirming.';
    } else {
      message = 'The email service did not accept it.';
    }

    return res.status(ok ? 200 : 502).json({ success: ok, message: message });
  } catch (err) {
    console.error('FormSubmit unreachable', err);
    return res.status(502).json({ success: false, message: 'The email service could not be reached.' });
  }
};
