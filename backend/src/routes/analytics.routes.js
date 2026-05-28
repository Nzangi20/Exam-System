const express = require('express');
const {
  getUsageAnalysis,
  getFeatureUsage,
  getInferenceData,
  getWorkloadAnalysis,
  getArchive,
  restoreArchive,
  permanentlyDeleteArchive,
} = require('../controllers/analytics.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();
const adminOnly = authenticate;
const requireSuperAdmin = authorize('SUPER_ADMIN');

router.get('/usage', adminOnly, requireSuperAdmin, getUsageAnalysis);
router.get('/features', adminOnly, requireSuperAdmin, getFeatureUsage);
router.get('/inference', adminOnly, requireSuperAdmin, getInferenceData);
router.get('/workload', adminOnly, requireSuperAdmin, getWorkloadAnalysis);
router.get('/archive', adminOnly, requireSuperAdmin, getArchive);
router.post('/archive/:id/restore', adminOnly, requireSuperAdmin, restoreArchive);
router.delete('/archive/:id', adminOnly, requireSuperAdmin, permanentlyDeleteArchive);

module.exports = router;
