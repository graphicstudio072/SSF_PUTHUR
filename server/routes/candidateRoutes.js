const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const authMiddleware = require('../middleware/authMiddleware');

// Public candidate registration
router.post('/register', candidateController.registerCandidate);

// Public/Admin ticket retrieval
router.get('/ticket/:ticketId', candidateController.getCandidateByTicket);

// Protected Admin routes
router.post('/check-in', authMiddleware, candidateController.checkInCandidate);
router.get('/', authMiddleware, candidateController.getAllCandidates);
router.get('/attendance-stats', authMiddleware, candidateController.getAttendanceStats);
router.patch('/:id/toggle-attendance', authMiddleware, candidateController.toggleCandidateAttendance);

module.exports = router;
