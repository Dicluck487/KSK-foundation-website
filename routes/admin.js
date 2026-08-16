// routes/admin.js
// Mount at app root: app.use('/admin', require('./ksk-admin/routes/admin'));
// (Login/apply routes live in routes/auth.js since they must stay PUBLIC.)
const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { imageUpload, publicationUpload } = require('../middleware/upload');

const adminController = require('../controllers/adminController');
const galleryController = require('../controllers/galleryController');
const publicationController = require('../controllers/publicationController');
const contactController = require('../controllers/contactController');
const newsletterController = require('../controllers/newsletterController');
const exportController = require('../controllers/exportController');

// Every route below requires an active, logged-in admin.
router.use(requireAuth);

// --- Dashboard ---
router.get('/dashboard', adminController.dashboard);
router.get('/', (req, res) => res.redirect('/admin/dashboard'));

// --- Admin applications (approve/reject) — Super Admin only ---
router.get('/applications', requireRole('super_admin'), adminController.listApplications);
router.post('/applications/:id/approve', requireRole('super_admin'), adminController.approveApplication);
router.post('/applications/:id/reject', requireRole('super_admin'), adminController.rejectApplication);

// --- Manage existing admins (role/status changes) — Super Admin only ---
router.get('/admins', requireRole('super_admin'), adminController.listAdmins);
router.post('/admins/:id/role', requireRole('super_admin'), adminController.updateAdminRole);
router.post('/admins/:id/status', requireRole('super_admin'), adminController.updateAdminStatus);

// --- Gallery — Super Admin + Content Admin can manage; Viewer read-only handled in view ---
router.get('/gallery', requireRole('super_admin', 'content_admin', 'viewer'), galleryController.listGallery);
router.post(
  '/gallery/upload',
  requireRole('super_admin', 'content_admin'),
  imageUpload.single('photo'),
  galleryController.uploadPhoto
);
router.post('/gallery/:id/status', requireRole('super_admin', 'content_admin'), galleryController.setPhotoStatus);
router.post('/gallery/:id/delete', requireRole('super_admin', 'content_admin'), galleryController.deletePhoto);

// --- Publications ---
router.get(
  '/publications',
  requireRole('super_admin', 'content_admin', 'viewer'),
  publicationController.listPublications
);
router.post(
  '/publications',
  requireRole('super_admin', 'content_admin'),
  publicationUpload.fields([{ name: 'cover', maxCount: 1 }, { name: 'document', maxCount: 1 }]),
  publicationController.createPublication
);
router.post(
  '/publications/:id/status',
  requireRole('super_admin', 'content_admin'),
  publicationController.setPublicationStatus
);
router.post(
  '/publications/:id/delete',
  requireRole('super_admin', 'content_admin'),
  publicationController.deletePublication
);

// --- Contact messages & partnership inquiries — all roles can view ---
router.get('/contacts', contactController.listMessages);
router.post('/contacts/:id/read', requireRole('super_admin', 'content_admin'), contactController.markRead);
router.get('/partnerships', contactController.listPartnerships);

// --- Newsletter subscribers ---
router.get('/subscribers', newsletterController.listSubscribers);

// --- CSV exports — every role can download (matches the doc's "Viewer can download CSVs") ---
router.get('/export/contacts', exportController.exportContacts);
router.get('/export/partnerships', exportController.exportPartnerships);
router.get('/export/subscribers', exportController.exportSubscribers);
router.get('/export/alumni', exportController.exportAlumni);

module.exports = router;
