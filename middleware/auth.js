// middleware/auth.js
// Guards any /admin/* route that requires a logged-in, active administrator.

function requireAuth(req, res, next) {
  if (req.session && req.session.user && req.session.user.status === 'active') {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  return res.redirect('/admin/login');
}

// Makes the logged-in user (or null) available to every EJS view as `currentAdmin`,
// without blocking the request. Mount this globally, before your routes.
function attachAdminToLocals(req, res, next) {
  res.locals.currentAdmin = (req.session && req.session.user) || null;
  next();
}

module.exports = { requireAuth, attachAdminToLocals };
