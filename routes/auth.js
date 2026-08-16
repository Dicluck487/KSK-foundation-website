// routes/auth.js
// Mount at app root: app.use('/', require('./ksk-admin/routes/auth'));
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const contactController = require('../controllers/contactController');
const newsletterController = require('../controllers/newsletterController');

// --- Admin login / logout / apply-for-access ---
router.get('/admin/login', authController.getLogin);
router.post('/admin/login', authController.postLogin);
router.post('/admin/logout', authController.logout);

router.get('/admin/apply', authController.getApply);
router.post('/admin/apply', authController.postApply);

// --- Public form submissions (wire these into your existing EJS <form> actions) ---
router.post('/contact', contactController.submitContactForm);
router.post('/partner-with-us', contactController.submitPartnershipForm);
router.post('/newsletter/subscribe', newsletterController.subscribe);
router.get('/unsubscribe', newsletterController.unsubscribe);

module.exports = router;
