const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route to populate unit dropdown in registration form
router.get('/', unitController.getUnits);

// Protected Admin routes for CRUD
router.post('/', authMiddleware, unitController.addUnit);
router.put('/:id', authMiddleware, unitController.updateUnit);
router.delete('/:id', authMiddleware, unitController.deleteUnit);

module.exports = router;
