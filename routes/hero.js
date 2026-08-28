const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');
const heroController = require('../controllers/heroController');

router.use(requireAuth);

router.get('/hero', heroController.listHero);
router.post('/hero/upload', imageUpload.single('image'), heroController.uploadHero);
router.post('/hero/:id/publish', heroController.publishHero);
router.post('/hero/:id/draft', heroController.setDraftHero);

module.exports = router;