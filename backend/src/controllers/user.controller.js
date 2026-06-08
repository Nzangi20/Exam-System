const prisma = require('../lib/prisma');
const bcrypt = require('bcrypt');

// Get all students (for trainers/admins)
const getStudents = async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT', deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        results: {
          select: {
            id: true,
            score: true,
            status: true,
            exam: { select: { title: true, totalMarks: true } }
          }
        }
      }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students', details: error.message });
  }
};

// Get all users (for super admins)
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
};

// Delete a user (super admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Prevent deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete yourself' });
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await prisma.archiveRecord.create({
      data: {
        entityType: 'USER',
        entityId: id,
        data: JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        }),
        deletedBy: req.user.id,
      },
    });

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    res.json({ message: 'User archived successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
};

// Update user role (super admin only)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['STUDENT', 'TRAINER', 'SUPER_ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role', details: error.message });
  }
};

// Update own profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // Password change
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
};

// Create a new user (super admin only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }
    if (!['STUDENT', 'TRAINER', 'SUPER_ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      }
    });

    if (role === 'STUDENT') {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          examCategory: 'PYTHON',
          examLevel: 'BEGINNER',
        }
      });
    } else if (role === 'TRAINER') {
      await prisma.trainerProfile.create({
        data: { userId: user.id }
      });
    }

    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
};

module.exports = {
  getStudents,
  getAllUsers,
  deleteUser,
  updateUserRole,
  updateProfile,
  createUser
};
