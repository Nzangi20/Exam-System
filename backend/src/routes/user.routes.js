const express = require('express');
const { getStudents, getAllUsers, deleteUser, updateUserRole, updateProfile, createUser, getPasswordResets, approvePasswordReset, rejectPasswordReset } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all students (trainers and admins)
router.get('/students', authenticate, authorize('TRAINER', 'SUPER_ADMIN'), getStudents);

// Get password reset requests (super admin only)
router.get('/password-resets', authenticate, authorize('SUPER_ADMIN'), getPasswordResets);

// Approve password reset request (super admin only)
router.put('/password-resets/:id/approve', authenticate, authorize('SUPER_ADMIN'), approvePasswordReset);

// Reject password reset request (super admin only)
router.put('/password-resets/:id/reject', authenticate, authorize('SUPER_ADMIN'), rejectPasswordReset);

// Get all users (super admin only)
router.get('/', authenticate, authorize('SUPER_ADMIN'), getAllUsers);

// Create a user (super admin only)
router.post('/', authenticate, authorize('SUPER_ADMIN'), createUser);

// Update own profile
router.put('/profile', authenticate, updateProfile);

// Update user role (super admin only)
router.put('/:id/role', authenticate, authorize('SUPER_ADMIN'), updateUserRole);

// Delete user (super admin only)
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), deleteUser);

module.exports = router;
