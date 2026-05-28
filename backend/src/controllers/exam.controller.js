const prisma = require('../lib/prisma');
const { logFeatureUsage } = require('../lib/featureUsage');

// Get all exams (students filtered by their category+level)
const getExams = async (req, res) => {
  try {
    let exams;
    if (req.user.role === 'TRAINER') {
      exams = await prisma.exam.findMany({
        where: { trainerId: req.user.id },
        include: { questions: true },
        orderBy: { createdAt: 'desc' },
      });
    } else if (req.user.role === 'SUPER_ADMIN') {
      exams = await prisma.exam.findMany({
        include: { questions: true, trainer: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // STUDENT: filter by their profile category and level
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!studentProfile) {
        return res.status(404).json({ error: 'Student profile not found' });
      }

      exams = await prisma.exam.findMany({
        where: {
          category: studentProfile.examCategory,
          level: studentProfile.examLevel,
        },
        include: { questions: { select: { id: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exams', details: error.message });
  }
};

const getExamById = async (req, res) => {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: req.params.id },
      include: {
        questions: (req.user.role === 'TRAINER' || req.user.role === 'SUPER_ADMIN') ? true : {
          select: { id: true, text: true, type: true, marks: true, options: true }
        },
        courseMaterials: {
          orderBy: { createdAt: 'desc' },
        },
        trainer: { select: { name: true, email: true } },
      },
    });
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exam', details: error.message });
  }
};

const createExam = async (req, res) => {
  try {
    const {
      title, description, instructions, duration, totalMarks,
      startDate, endDate, allowedAttempts, passingMarks,
      category, level,
    } = req.body;

    const exam = await prisma.exam.create({
      data: {
        title, description, instructions,
        duration: parseInt(duration),
        totalMarks: parseInt(totalMarks),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        allowedAttempts: parseInt(allowedAttempts) || 1,
        passingMarks: parseInt(passingMarks),
        category: category || 'PYTHON',
        level: level || 'BEGINNER',
        trainerId: req.user.id,
      },
    });
    await logFeatureUsage(req.user.id, 'EXAM_CREATE', { examId: exam.id, title: exam.title });
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create exam', details: error.message });
  }
};

const updateExam = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    if (data.duration) data.duration = parseInt(data.duration);
    if (data.totalMarks) data.totalMarks = parseInt(data.totalMarks);
    if (data.passingMarks) data.passingMarks = parseInt(data.passingMarks);
    if (data.allowedAttempts) data.allowedAttempts = parseInt(data.allowedAttempts);

    const exam = await prisma.exam.update({
      where: { id: req.params.id },
      data,
    });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update exam', details: error.message });
  }
};

const deleteExam = async (req, res) => {
  try {
    await prisma.exam.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete exam', details: error.message });
  }
};

const logActivity = async (req, res) => {
  try {
    const { examId, studentId, eventType, details } = req.body;
    const log = await prisma.activityLog.create({
      data: { examId, studentId, eventType, details }
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log activity', details: error.message });
  }
};

module.exports = {
  getExams, getExamById, createExam, updateExam, deleteExam, logActivity
};
