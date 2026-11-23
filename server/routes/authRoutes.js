const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public PIN verification
router.post('/verify-pin', authController.verifyPin);

// Protected Admin session check
router.get('/verify-session', authMiddleware, authController.verifySession);

// Protected Admin PIN change
router.post('/change-pin', authMiddleware, authController.changePin);

module.exports = router;
