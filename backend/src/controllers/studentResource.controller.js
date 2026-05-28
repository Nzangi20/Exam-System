const prisma = require('../lib/prisma');
const { logFeatureUsage } = require('../lib/featureUsage');

const buildFileUrl = (req, filename) =>
  `${req.protocol}://${req.get('host')}/uploads/${filename}`;

// Trainer: list own uploads
const getTrainerResources = async (req, res) => {
  try {
    const where =
      req.user.role === 'SUPER_ADMIN' ? {} : { trainerId: req.user.id };

    const resources = await prisma.studentResource.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true } },
        trainer: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resources', details: error.message });
  }
};

// Student: list materials visible to them
const getStudentResources = async (req, res) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const resources = await prisma.studentResource.findMany({
      where: {
        OR: [
          { studentId: req.user.id },
          {
            studentId: null,
            AND: [
              { OR: [{ category: null }, { category: profile.examCategory }] },
              { OR: [{ level: null }, { level: profile.examLevel }] },
            ],
          },
        ],
      },
      include: {
        trainer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resources', details: error.message });
  }
};

// Trainer upload notes / revision file for students
const createStudentResource = async (req, res) => {
  try {
    const { title, description, materialType, fileType, category, level, studentId } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const type = ['NOTES', 'REVISION'].includes(materialType) ? materialType : 'NOTES';

    if (studentId) {
      const student = await prisma.user.findFirst({
        where: { id: studentId, role: 'STUDENT', deletedAt: null },
      });
      if (!student) {
        return res.status(400).json({ error: 'Invalid student selected' });
      }
    }

    const resource = await prisma.studentResource.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        materialType: type,
        fileUrl: buildFileUrl(req, req.file.filename),
        fileName: req.file.originalname,
        fileType: fileType || 'document',
        category: category && category !== 'ALL' ? category : null,
        level: level && level !== 'ALL' ? level : null,
        studentId: studentId || null,
        trainerId: req.user.id,
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        trainer: { select: { name: true } },
      },
    });

    await logFeatureUsage(req.user.id, 'STUDENT_RESOURCE_UPLOAD', {
      resourceId: resource.id,
      materialType: type,
    });

    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload resource', details: error.message });
  }
};

const deleteStudentResource = async (req, res) => {
  try {
    const resource = await prisma.studentResource.findUnique({
      where: { id: req.params.id },
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (resource.trainerId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.studentResource.delete({ where: { id: req.params.id } });
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resource', details: error.message });
  }
};

module.exports = {
  getTrainerResources,
  getStudentResources,
  createStudentResource,
  deleteStudentResource,
};
