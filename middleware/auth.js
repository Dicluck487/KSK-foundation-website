// middleware/auth.js
// Guards any /admin/* route that requires a logged-in, active administrator.

function requireAuth(req, res, next) {
    // User is authenticated and active
    if (
        req.session &&
        req.session.user &&
        req.session.user.status === 'active'
    ) {
        return next();
    }

    // Store the page they were trying to access
    // only when a session actually exists.
    if (req.session) {
        req.session.returnTo = req.originalUrl;
    }

    // return res.redirect('/admin/login');
    return res.redirect('/auth/login');
}


// Makes the logged-in user (or null) available to every EJS view
// as `currentAdmin`, without blocking the request.
function attachAdminToLocals(req, res, next) {
    res.locals.currentAdmin =
        (req.session && req.session.user) || null;

    next();
}


module.exports = {
    requireAuth,
    attachAdminToLocals
};