const express = require('express');
const { getMaterialsByExam, createMaterial, deleteMaterial } = require('../controllers/material.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Any authenticated user can view materials
router.get('/:examId', authenticate, getMaterialsByExam);

// Only trainers/admins can upload materials
router.post('/', authenticate, authorize('TRAINER', 'SUPER_ADMIN'), upload.single('file'), createMaterial);

// Only trainers/admins can delete materials
router.delete('/:id', authenticate, authorize('TRAINER', 'SUPER_ADMIN'), deleteMaterial);

module.exports = router;
