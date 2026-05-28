const express = require('express');
const { getStudents, getAllUsers, deleteUser, updateUserRole, updateProfile } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all students (trainers and admins)
router.get('/students', authenticate, authorize('TRAINER', 'SUPER_ADMIN'), getStudents);

// Get all users (super admin only)
router.get('/', authenticate, authorize('SUPER_ADMIN'), getAllUsers);

// Update own profile
router.put('/profile', authenticate, updateProfile);

// Update user role (super admin only)
router.put('/:id/role', authenticate, authorize('SUPER_ADMIN'), updateUserRole);

// Delete user (super admin only)
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), deleteUser);

module.exports = router;
