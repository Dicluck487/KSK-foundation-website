// middleware/roles.js
// Usage: router.post('/admins/:id/approve', requireAuth, requireRole('super_admin'), approveAdmin)

function requireRole(...allowedRoles) {
  return function (req, res, next) {
    const user = req.session && req.session.user;
    if (!user) {
      return res.redirect('/admin/login');
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).render('admin/error', {
        title: 'Access denied',
        message: "You don't have permission to do that. This action requires: " +
          allowedRoles.join(' or ') + '.',
      });
    }
    return next();
  };
}

module.exports = { requireRole };
