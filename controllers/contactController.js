// controllers/contactController.js
const supabase = require('../config/supabase');

const REASON_LABELS = {
  general_enquiry: 'General Enquiry',
  partnership: 'Partnership',
  media: 'Media',
  other: 'Other',
};

// ---------- PUBLIC: contact-us.ejs posts here ----------
// POST /contact-us
async function submitContactForm(req, res) {
  const { name, email, organization, reason, message } = req.body;

  const renderArgs = { title: 'Contact KSK Foundation' };

  if (!name || !email || !reason || !message) {
    return res.render('contact-us', {
      ...renderArgs,
      error: 'Name, email, reason, and message are all required.',
    });
  }

  const { error } = await supabase.from('contact_messages').insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    organization: organization || null,
    subject: REASON_LABELS[reason] || reason,
    message: message.trim(),
  });

  if (error) {
    return res.render('contact-us', {
      ...renderArgs,
      error: 'Something went wrong sending your message. Please try again.',
    });
  }

  res.render('contact-us', { ...renderArgs, success: true });
}

// ---------- PUBLIC: "Partner With Us" form (unchanged) ----------
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
async function listMessages(req, res) {
  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
  res.render('admin/contacts', { messages: messages || [] });
}

async function markRead(req, res) {
  await supabase.from('contact_messages').update({ status: 'read' }).eq('id', req.params.id);
  res.redirect('/admin/contacts');
}

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