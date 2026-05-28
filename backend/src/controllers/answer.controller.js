const prisma = require('../lib/prisma');
const { logFeatureUsage } = require('../lib/featureUsage');

const submitAnswer = async (req, res) => {
  try {
    const { examId, questionId, textAnswer, fileUrl } = req.body;
    const studentId = req.user.id;

    // Check if the answer already exists for this question by this student
    let answer = await prisma.answer.findFirst({
      where: { examId, questionId, studentId }
    });

    if (answer) {
      // Update
      answer = await prisma.answer.update({
        where: { id: answer.id },
        data: { textAnswer, fileUrl }
      });
    } else {
      // Create
      answer = await prisma.answer.create({
        data: { examId, questionId, studentId, textAnswer, fileUrl }
      });
    }

    await logFeatureUsage(studentId, 'EXAM_SUBMIT', { examId, questionId });
    res.json(answer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit answer', details: error.message });
  }
};

const getAnswersForExam = async (req, res) => {
  try {
    const { examId, studentId } = req.params;
    
    // Only trainer/super_admin or the student themselves can see these
    if (req.user.role === 'STUDENT' && req.user.id !== studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const answers = await prisma.answer.findMany({
      where: { examId, studentId },
      include: { question: true }
    });
    res.json(answers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get answers', details: error.message });
  }
};

module.exports = {
  submitAnswer, getAnswersForExam
};
