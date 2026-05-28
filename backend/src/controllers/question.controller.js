const prisma = require('../lib/prisma');

const addQuestion = async (req, res) => {
  try {
    const { examId, text, type, marks, options, correctAnswer } = req.body;
    const question = await prisma.question.create({
      data: {
        examId, text, type, marks, 
        options: options ? JSON.stringify(options) : null,
        correctAnswer
      }
    });
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add question', details: error.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { text, type, marks, options, correctAnswer } = req.body;
    const dataToUpdate = { text, type, marks, correctAnswer };
    if (options !== undefined) {
      dataToUpdate.options = options ? JSON.stringify(options) : null;
    }
    const question = await prisma.question.update({
      where: { id: req.params.id },
      data: dataToUpdate
    });
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question', details: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    await prisma.question.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question', details: error.message });
  }
};

module.exports = {
  addQuestion, updateQuestion, deleteQuestion
};
