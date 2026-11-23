const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/roles', candidateController.getRoles);
router.post('/register', candidateController.registerCandidate);
router.get('/ticket/:ticketId', candidateController.getCandidateByTicket);

// Protected Admin routes
router.post('/check-in', authMiddleware, candidateController.checkInCandidate);
router.get('/', authMiddleware, candidateController.getAllCandidates);
router.get('/attendance-stats', authMiddleware, candidateController.getAttendanceStats);
router.patch('/:id/toggle-attendance', authMiddleware, candidateController.toggleCandidateAttendance);
router.delete('/:id', authMiddleware, candidateController.deleteCandidate);

module.exports = router;
