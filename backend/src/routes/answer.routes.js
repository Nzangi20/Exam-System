const express = require('express');
const { submitAnswer, getAnswersForExam } = require('../controllers/answer.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticate, submitAnswer);
router.get('/:examId/:studentId', authenticate, getAnswersForExam);

module.exports = router;
