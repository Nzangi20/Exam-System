const express = require('express');
const { submitExam, getResults, updateResult } = require('../controllers/result.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/submit', authenticate, submitExam);
router.get('/', authenticate, getResults);
router.put('/:id', authenticate, authorize('TRAINER', 'SUPER_ADMIN'), updateResult);

module.exports = router;
