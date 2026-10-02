// routes/hero.js

const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const heroController = require('../controllers/heroController');

// All Hero management routes require authentication.
router.use(requireAuth);

// View Hero images.
router.get(
  '/hero-images',
  requireRole('super_admin', 'content_admin', 'viewer'),
  heroController.listHeroImages
);

// Create Hero database record.
router.post(
  '/hero-images',
  requireRole('super_admin', 'content_admin'),
  heroController.createHeroImage
);

// Publish/draft.
router.post(
  '/hero-images/:id/status',
  requireRole('super_admin', 'content_admin'),
  heroController.updateHeroStatus
);

// Delete.
router.post(
  '/hero-images/:id/delete',
  requireRole('super_admin', 'content_admin'),
  heroController.deleteHeroImage
);

module.exports = router;