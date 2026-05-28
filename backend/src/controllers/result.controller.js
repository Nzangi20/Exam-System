const prisma = require('../lib/prisma');

const submitExam = async (req, res) => {
  try {
    const { examId } = req.body;
    const studentId = req.user.id;

    // 1. Fetch exam and its questions
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true }
    });

    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    // 2. Fetch student's answers
    const answers = await prisma.answer.findMany({
      where: { examId, studentId }
    });

    let totalScore = 0;
    let needsManualGrading = false;

    // 3. Auto-grade objective questions
    for (const question of exam.questions) {
      const studentAnswer = answers.find(a => a.questionId === question.id);
      
      if (!studentAnswer) continue; // No answer provided

      if (['MCQ', 'TRUE_FALSE'].includes(question.type)) {
        if (studentAnswer.textAnswer === question.correctAnswer) {
          totalScore += question.marks;
          // Update answer with awarded marks
          await prisma.answer.update({
            where: { id: studentAnswer.id },
            data: { marksAwarded: question.marks }
          });
        } else {
           await prisma.answer.update({
            where: { id: studentAnswer.id },
            data: { marksAwarded: 0 }
          });
        }
      } else {
        needsManualGrading = true;
      }
    }

    const status = needsManualGrading ? 'PENDING' : (totalScore >= exam.passingMarks ? 'PASS' : 'FAIL');

    // 4. Create Result
    const result = await prisma.result.create({
      data: {
        examId,
        studentId,
        score: totalScore,
        status
      }
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit exam', details: error.message });
  }
};

const getResults = async (req, res) => {
  try {
    if (req.user.role === 'STUDENT') {
      const results = await prisma.result.findMany({
        where: { studentId: req.user.id },
        include: { exam: { select: { title: true, totalMarks: true } } }
      });
      return res.json(results);
    } else if (req.user.role === 'SUPER_ADMIN') {
      // Super admin sees ALL results
      const results = await prisma.result.findMany({
        include: { 
          exam: { select: { title: true, totalMarks: true } },
          student: { select: { name: true, email: true } }
        }
      });
      return res.json(results);
    } else {
      // Trainer getting results for their exams
      const results = await prisma.result.findMany({
        where: { exam: { trainerId: req.user.id } },
        include: { 
          exam: { select: { title: true, totalMarks: true } },
          student: { select: { name: true, email: true } }
        }
      });
      return res.json(results);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results', details: error.message });
  }
};

const updateResult = async (req, res) => {
  try {
    const { score, status } = req.body;
    const result = await prisma.result.update({
      where: { id: req.params.id },
      data: { score, status }
    });
    res.json(result);
  } catch (error) {
     res.status(500).json({ error: 'Failed to update result', details: error.message });
  }
};

module.exports = {
  submitExam, getResults, updateResult
};
