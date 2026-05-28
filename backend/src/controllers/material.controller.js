const prisma = require('../lib/prisma');

// Get all materials for an exam
const getMaterialsByExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const materials = await prisma.courseMaterial.findMany({
      where: { examId },
      include: {
        uploader: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch materials', details: error.message });
  }
};

// Upload a new material (trainer uploads file + metadata)
const createMaterial = async (req, res) => {
  try {
    const { examId, title, description, fileType } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const material = await prisma.courseMaterial.create({
      data: {
        title,
        description: description || '',
        fileUrl,
        fileType: fileType || 'document',
        examId,
        uploaderId: req.user.id,
      },
    });

    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload material', details: error.message });
  }
};

// Delete a material
const deleteMaterial = async (req, res) => {
  try {
    const material = await prisma.courseMaterial.findUnique({
      where: { id: req.params.id },
    });

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Only the uploader or super admin can delete
    if (material.uploaderId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.courseMaterial.delete({ where: { id: req.params.id } });
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete material', details: error.message });
  }
};

module.exports = { getMaterialsByExam, createMaterial, deleteMaterial };
