const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

// GET /admin/login
function getLogin(req, res) {
    res.render('admin/login', {
        layout: false,
        title: 'Admin Login',
        description: 'KSK Foundation administrator login',
        error: null
    });
}

// POST /admin/login
async function postLogin(req, res) {
  const { email, password } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', String(email).toLowerCase().trim())
    .maybeSingle();

  if (error || !user) {
    return res.render('admin/login', {
      layout: false,
      title: 'Admin Login',
      description: 'KSK Foundation administrator login',
      error: 'Invalid email or password.',
    });
  }

  if (user.status !== 'active') {
    return res.render('admin/login', {
      layout: false,
      title: 'Admin Login',
      description: 'KSK Foundation administrator login',
      error: user.status === 'pending'
        ? 'Your account is still pending approval by a Super Admin.'
        : 'This account is not active. Contact a Super Admin.',
    });
  }

  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    return res.render('admin/login', {
      layout: false,
      title: 'Admin Login',
      description: 'KSK Foundation administrator login',
      error: 'Invalid email or password.',
    });
  }

  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };

  const redirectTo = req.session.returnTo || '/admin/dashboard';
  delete req.session.returnTo;

  res.redirect(redirectTo);
}

// POST /admin/logout
function logout(req, res) {
  req.session.destroy(() => res.redirect('/admin/login'));
}

// GET /admin/apply  — public "request admin access" form
function getApply(req, res) {
  res.render('admin/apply', {
    layout: false,
    title: 'Request Admin Access',
    description: 'Request administrator access to the KSK Foundation website.',
    error: null,
    success: false,
  });
}

// POST /admin/apply
async function postApply(req, res) {
  const { name, email, phone, organization, reason } = req.body;

  if (!name || !email || !reason) {
    return res.render('admin/apply', {
      layout: false,
      title: 'Request Admin Access',
      description: 'Request administrator access to the KSK Foundation website.',
      error: 'Name, email, and reason for access are required.',
      success: false,
    });
  }

  const { error } = await supabase.from('admin_applications').insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone || null,
    organization: organization || null,
    reason: reason.trim(),
    status: 'pending',
  });

  if (error) {
    return res.render('admin/apply', {
      layout: false,
      title: 'Request Admin Access',
      description: 'Request administrator access to the KSK Foundation website.',
      error: 'Something went wrong submitting your application. Please try again.',
      success: false,
    });
  }

  // IMPORTANT: this NEVER grants access. It just queues a request that a
  // Super Admin has to review and approve from /admin/applications.
  res.render('admin/apply', {
    layout: false,
    title: 'Request Admin Access',
    description: 'Request administrator access to the KSK Foundation website.',
    error: null,
    success: true,
  });
}

module.exports = { getLogin, postLogin, logout, getApply, postApply };
