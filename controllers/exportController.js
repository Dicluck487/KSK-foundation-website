// controllers/exportController.js
// Simple, dependency-free CSV writer — no need for extra npm packages.
const supabase = require('../config/supabase');

function toCsv(rows, columns) {
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    return /[",\n]/.test(str) ? `"${str}"` : str;
  };
  const header = columns.map((c) => c.label).join(',');
  const lines = rows.map((row) => columns.map((c) => escape(row[c.key])).join(','));
  return [header, ...lines].join('\n');
}

function sendCsv(res, filename, csv) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

// GET /admin/export/contacts
async function exportContacts(req, res) {
  const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
  const csv = toCsv(data || [], [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'organization', label: 'Organization' },
    { key: 'subject', label: 'Subject' },
    { key: 'message', label: 'Message' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Date' },
  ]);
  sendCsv(res, 'contacts.csv', csv);
}

// GET /admin/export/partnerships
async function exportPartnerships(req, res) {
  const { data } = await supabase.from('partnership_inquiries').select('*').order('created_at', { ascending: false });
  const csv = toCsv(data || [], [
    { key: 'name', label: 'Name' },
    { key: 'organization', label: 'Organization' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'interest_area', label: 'Interest Area' },
    { key: 'message', label: 'Message' },
    { key: 'created_at', label: 'Date' },
  ]);
  sendCsv(res, 'partnership-applications.csv', csv);
}

// GET /admin/export/subscribers
async function exportSubscribers(req, res) {
  const { data } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('status', 'subscribed')
    .order('subscribed_at', { ascending: false });
  const csv = toCsv(data || [], [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'subscribed_at', label: 'Subscribed At' },
  ]);
  sendCsv(res, 'subscribers.csv', csv);
}

// GET /admin/export/alumni
async function exportAlumni(req, res) {
  const { data } = await supabase.from('alumni').select('*').order('created_at', { ascending: false });
  const csv = toCsv(data || [], [
    { key: 'name', label: 'Name' },
    { key: 'cohort', label: 'Cohort' },
    { key: 'program', label: 'Program' },
    { key: 'testimonial', label: 'Testimonial' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Date' },
  ]);
  sendCsv(res, 'alumni.csv', csv);
}

module.exports = { exportContacts, exportPartnerships, exportSubscribers, exportAlumni };
