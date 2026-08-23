// controllers/programApplicationController.js
const supabase = require('../config/supabase');

// ---------- PUBLIC ----------
// POST /apply  — replaces the old console.log placeholder
async function submitApplication(req, res) {
  const { name, email, phone, motivation } = req.body;

  if (!name || !email || !motivation) {
    return res.render('apply', {
      submitted: false,
      error: 'Name, email, and your motivation are required.',
    });
  }

  const { error } = await supabase.from('program_applications').insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone || null,
    motivation: motivation.trim(),
  });

  if (error) {
    return res.render('apply', {
      submitted: false,
      error: 'Something went wrong submitting your application. Please try again.',
    });
  }

  // Pass the name/email through so the success view can personalize the
  // congratulations message and pre-fill the newsletter subscribe form.
  res.render('apply', { submitted: true, applicantName: name.trim(), applicantEmail: email.trim() });
}

// ---------- ADMIN ----------
// GET /admin/program-applications
async function listApplications(req, res) {
  const { data: applications } = await supabase
    .from('program_applications')
    .select('*')
    .order('created_at', { ascending: false });

  res.render('admin/program-applications', { applications: applications || [] });
}

module.exports = { submitApplication, listApplications };
