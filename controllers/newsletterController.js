// controllers/newsletterController.js
const supabase = require('../config/supabase');

// ---------- PUBLIC ----------
// POST /newsletter/subscribe
// Reused by the homepage widget, footer widget, and contact page widget —
// all three should point their <form> at this single endpoint.
async function subscribe(req, res) {
  const { name, email } = req.body;
  if (!email) return res.status(400).send('Email is required.');

  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert(
      { name: name || null, email: email.trim().toLowerCase(), status: 'subscribed', subscribed_at: new Date() },
      { onConflict: 'email' }
    );

  if (error) return res.status(500).send('Something went wrong. Please try again.');

  // Adjust the redirect target to wherever the submitting form lives.
  const back = req.get('Referer') || '/';
  res.redirect(back + (back.includes('?') ? '&' : '?') + 'subscribed=1');
}

// GET /unsubscribe?email=...
async function unsubscribe(req, res) {
  const { email } = req.query;
  if (email) {
    await supabase
      .from('newsletter_subscribers')
      .update({ status: 'unsubscribed', unsubscribed_at: new Date() })
      .eq('email', String(email).toLowerCase());
  }
  res.send('You have been unsubscribed. Sorry to see you go.');
}

// ---------- ADMIN ----------
// GET /admin/subscribers
async function listSubscribers(req, res) {
  const { data: subscribers } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false });
  res.render('admin/subscribers', { subscribers: subscribers || [] });
}

module.exports = { subscribe, unsubscribe, listSubscribers };
