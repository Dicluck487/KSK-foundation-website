// controllers/adminController.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const supabase = require('../config/supabase');

// GET /admin/dashboard
// Replace the existing `dashboard` function in controllers/adminController.js with this:

// Replace the existing `dashboard` function in controllers/adminController.js with this:

async function dashboard(req, res) {
  const [
    { count: contactsCount },
    { count: unreadContactsCount },
    { count: partnersCount },
    { count: subscribersCount },
    { count: alumniCount },
    { count: programApplicationsCount },
    { count: pendingAppsCount },
    { data: recentMessages },
  ] = await Promise.all([
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'unread'),
    supabase.from('partnership_inquiries').select('*', { count: 'exact', head: true }),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('status', 'subscribed'),
    supabase.from('alumni').select('*', { count: 'exact', head: true }),
    supabase.from('program_applications').select('*', { count: 'exact', head: true }),
    supabase.from('admin_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(5),
  ]);

  res.render('admin/dashboard', {
    stats: {
      contacts: contactsCount || 0,
      unreadContacts: unreadContactsCount || 0,
      partners: partnersCount || 0,
      subscribers: subscribersCount || 0,
      alumni: alumniCount || 0,
      programApplications: programApplicationsCount || 0,
      pendingApps: pendingAppsCount || 0,
    },
    recentMessages: recentMessages || [],
  });
}

// GET /admin/applications  (super_admin only)
async function listApplications(req, res) {
  const { data: applications } = await supabase
    .from('admin_applications')
    .select('*')
    .order('created_at', { ascending: false });

  res.render('admin/applications', { applications: applications || [] });
}

// POST /admin/applications/:id/approve  (super_admin only)
async function approveApplication(req, res) {
  const { id } = req.params;
  const { role } = req.body; // 'content_admin' or 'viewer'

  const { data: application, error: fetchErr } = await supabase
    .from('admin_applications')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr || !application || application.status !== 'pending') {
    return res.redirect('/admin/applications');
  }

  // Generate a temporary password — shown once to the Super Admin to relay
  // securely to the new admin (e.g. in person, WhatsApp, phone call).
  const tempPassword = crypto.randomBytes(6).toString('hex');
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const { error: insertErr } = await supabase.from('users').insert({
    name: application.name,
    email: application.email,
    password_hash: passwordHash,
    role: ['content_admin', 'viewer'].includes(role) ? role : 'viewer',
    status: 'active',
  });

  if (insertErr) {
    return res.render('admin/error', {
      title: 'Could not approve applicant',
      message: insertErr.message.includes('duplicate')
        ? 'A user with this email already exists.'
        : 'Something went wrong creating the account.',
    });
  }

  await supabase
    .from('admin_applications')
    .update({ status: 'approved', reviewed_by: req.session.user.id, reviewed_at: new Date() })
    .eq('id', id);

  res.render('admin/application-approved', {
    name: application.name,
    email: application.email,
    tempPassword,
  });
}

// POST /admin/applications/:id/reject  (super_admin only)
async function rejectApplication(req, res) {
  const { id } = req.params;
  await supabase
    .from('admin_applications')
    .update({ status: 'rejected', reviewed_by: req.session.user.id, reviewed_at: new Date() })
    .eq('id', id);
  res.redirect('/admin/applications');
}

// GET /admin/admins  (super_admin only)
async function listAdmins(req, res) {
  const { data: admins } = await supabase
    .from('users')
    .select('id, name, email, role, status, created_at')
    .order('created_at', { ascending: false });

  res.render('admin/admins', { admins: admins || [], currentUserId: req.session.user.id });
}

// POST /admin/admins/:id/role  (super_admin only)
async function updateAdminRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;

  if (id === req.session.user.id) {
    // Prevent a Super Admin from demoting themselves and locking everyone out.
    return res.redirect('/admin/admins');
  }
  if (!['super_admin', 'content_admin', 'viewer'].includes(role)) {
    return res.redirect('/admin/admins');
  }

  await supabase.from('users').update({ role, updated_at: new Date() }).eq('id', id);
  res.redirect('/admin/admins');
}

// POST /admin/admins/:id/status  (super_admin only) — suspend/reactivate
async function updateAdminStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (id === req.session.user.id) {
    return res.redirect('/admin/admins');
  }
  if (!['active', 'suspended'].includes(status)) {
    return res.redirect('/admin/admins');
  }

  await supabase.from('users').update({ status, updated_at: new Date() }).eq('id', id);
  res.redirect('/admin/admins');
}

module.exports = {
  dashboard,
  listApplications,
  approveApplication,
  rejectApplication,
  listAdmins,
  updateAdminRole,
  updateAdminStatus,
};
