const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');
const alumniController = require('../controllers/alumniController');

router.use(requireAuth);

router.get('/alumni', alumniController.listAlumni);
router.post('/alumni/upload', imageUpload.single('image'), alumniController.uploadAlumni);
router.post('/alumni/:id/publish', alumniController.publishAlumni);
router.post('/alumni/:id/draft', alumniController.setDraftAlumni);



module.exports = router;