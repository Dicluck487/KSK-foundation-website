// routes/alumni.js

const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const alumniController = require('../controllers/alumniController');


// All Alumni administration requires authentication.
router.use(requireAuth);


// ---------------------------------------------------------
// View Alumni
// Super Admin + Content Admin + Viewer
// ---------------------------------------------------------

router.get(
  '/alumni',
  requireRole('super_admin', 'content_admin', 'viewer'),
  alumniController.listAlumni
);


// ---------------------------------------------------------
// Create Alumni
// Super Admin + Content Admin
// ---------------------------------------------------------

router.post(
  '/alumni',
  requireRole('super_admin', 'content_admin'),
  alumniController.createAlumni
);


// ---------------------------------------------------------
// Update Alumni status
// Super Admin + Content Admin
// ---------------------------------------------------------

router.post(
  '/alumni/:id/status',
  requireRole('super_admin', 'content_admin'),
  alumniController.updateAlumniStatus
);


// ---------------------------------------------------------
// Delete Alumni
// Super Admin + Content Admin
// ---------------------------------------------------------

router.post(
  '/alumni/:id/delete',
  requireRole('super_admin', 'content_admin'),
  alumniController.deleteAlumni
);


module.exports = router;