const express = require('express');
const { getExams, getExamById, createExam, updateExam, deleteExam, logActivity } = require('../controllers/exam.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, getExams);
router.get('/:id', authenticate, getExamById);
router.post('/', authenticate, authorize('TRAINER', 'SUPER_ADMIN'), createExam);
router.put('/:id', authenticate, authorize('TRAINER', 'SUPER_ADMIN'), updateExam);
router.delete('/:id', authenticate, authorize('TRAINER', 'SUPER_ADMIN'), deleteExam);

// Anti-cheating log route
router.post('/log', authenticate, logActivity);

module.exports = router;
