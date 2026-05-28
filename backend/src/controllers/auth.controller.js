const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { logFeatureUsage } = require('../lib/featureUsage');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '1d',
  });
};

const register = async (req, res) => {
  try {
    const { email, password, name, role, examCategory, examLevel } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    if (role === 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Cannot register as SUPER_ADMIN' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'STUDENT',
      },
    });

    // Create profile based on role
    if (user.role === 'STUDENT') {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          examCategory: examCategory || 'PYTHON',
          examLevel: examLevel || 'BEGINNER',
        },
      });
    } else if (user.role === 'TRAINER') {
      await prisma.trainerProfile.create({
        data: { userId: user.id },
      });
    }

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        examCategory: examCategory || null,
        examLevel: examLevel || null,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.deletedAt) {
      return res.status(403).json({ error: 'Account has been deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    await logFeatureUsage(user.id, 'LOGIN');

    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        studentProfile: {
          select: {
            examCategory: true,
            examLevel: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      examCategory: user.studentProfile?.examCategory || null,
      examLevel: user.studentProfile?.examLevel || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user profile', details: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
