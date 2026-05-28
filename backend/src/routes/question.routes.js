const express = require('express');
const { addQuestion, updateQuestion, deleteQuestion } = require('../controllers/question.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticate, authorize('TRAINER', 'SUPER_ADMIN'), addQuestion);
router.put('/:id', authenticate, authorize('TRAINER', 'SUPER_ADMIN'), updateQuestion);
router.delete('/:id', authenticate, authorize('TRAINER', 'SUPER_ADMIN'), deleteQuestion);

module.exports = router;
