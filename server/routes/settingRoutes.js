const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public route to fetch site settings, theme, branding & event details
router.get('/', settingController.getSettings);

// Protected Admin routes
router.put('/', authMiddleware, settingController.updateSettings);
router.post('/upload-logo', authMiddleware, upload.single('logo'), settingController.uploadLogo);
router.post('/upload-poster', authMiddleware, upload.single('poster'), settingController.uploadPoster);
router.post('/upload-ticket-template', authMiddleware, upload.single('template'), settingController.uploadTicketTemplate);

module.exports = router;
