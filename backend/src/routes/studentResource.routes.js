const express = require('express');
const {
  getTrainerResources,
  getStudentResources,
  createStudentResource,
  deleteStudentResource,
} = require('../controllers/studentResource.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.get(
  '/trainer',
  authenticate,
  authorize('TRAINER', 'SUPER_ADMIN'),
  getTrainerResources
);

router.get('/student', authenticate, authorize('STUDENT'), getStudentResources);

router.post(
  '/',
  authenticate,
  authorize('TRAINER', 'SUPER_ADMIN'),
  upload.single('file'),
  createStudentResource
);

router.delete(
  '/:id',
  authenticate,
  authorize('TRAINER', 'SUPER_ADMIN'),
  deleteStudentResource
);

module.exports = router;
