// controllers/contactController.js
const supabase = require('../config/supabase');

// ---------- PUBLIC: called from your existing contact-us.ejs form ----------
// POST /contact  (hook this into your existing public route)
async function submitContactForm(req, res) {
  const { name, email, phone, organization, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send('Name, email and message are required.');
  }

  const { error } = await supabase.from('contact_messages').insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone || null,
    organization: organization || null,
    subject: subject || null,
    message: message.trim(),
  });

  if (error) return res.status(500).send('Something went wrong. Please try again.');

  // Adjust to match how your existing contact-us.ejs currently confirms submission.
  res.redirect('/contact-us?submitted=1');
}

// ---------- PUBLIC: "Partner With Us" form ----------
// POST /partner-with-us
async function submitPartnershipForm(req, res) {
  const { name, organization, email, phone, interest_area, message } = req.body;

  if (!name || !email) {
    return res.status(400).send('Name and email are required.');
  }

  const { error } = await supabase.from('partnership_inquiries').insert({
    name: name.trim(),
    organization: organization || null,
    email: email.trim().toLowerCase(),
    phone: phone || null,
    interest_area: interest_area || 'Other',
    message: message || null,
  });

  if (error) return res.status(500).send('Something went wrong. Please try again.');
  res.redirect('/partner-with-us?submitted=1');
}

// ---------- ADMIN ----------
// GET /admin/contacts
async function listMessages(req, res) {
  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
  res.render('admin/contacts', { messages: messages || [] });
}

// POST /admin/contacts/:id/read
async function markRead(req, res) {
  await supabase.from('contact_messages').update({ status: 'read' }).eq('id', req.params.id);
  res.redirect('/admin/contacts');
}

// GET /admin/partnerships
async function listPartnerships(req, res) {
  const { data: inquiries } = await supabase
    .from('partnership_inquiries')
    .select('*')
    .order('created_at', { ascending: false });
  res.render('admin/partnerships', { inquiries: inquiries || [] });
}

module.exports = {
  submitContactForm,
  submitPartnershipForm,
  listMessages,
  markRead,
  listPartnerships,
};
