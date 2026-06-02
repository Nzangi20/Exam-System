const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient({});

async function main() {
  console.log('Seeding database...');

  // Clean up any existing seed data to prevent P2002 unique constraint errors
  console.log('Cleaning up existing seed data...');
  
  await prisma.studentProfile.deleteMany({
    where: {
      user: {
        email: { in: ['trainer@example.com', 'student@example.com', 'admin@example.com'] }
      }
    }
  });

  await prisma.trainerProfile.deleteMany({
    where: {
      user: {
        email: { in: ['trainer@example.com', 'student@example.com', 'admin@example.com'] }
      }
    }
  });

  await prisma.exam.deleteMany({
    where: {
      trainer: {
        email: 'trainer@example.com'
      }
    }
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['trainer@example.com', 'student@example.com', 'admin@example.com']
      }
    }
  });

  console.log('Clean-up complete. Re-creating users...');

  // 1. Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const trainer = await prisma.user.create({
    data: {
      name: 'John Trainer',
      email: 'trainer@example.com',
      password: hashedPassword,
      role: 'TRAINER',
      trainerProfile: {
        create: {}
      }
    }
  });

  const student = await prisma.user.create({
    data: {
      name: 'Alice Student',
      email: 'student@example.com',
      password: hashedPassword,
      role: 'STUDENT',
      studentProfile: {
        create: {}
      }
    }
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    }
  });

  console.log('Users created.');

  // 2. Create Exam
  const exam = await prisma.exam.create({
    data: {
      title: 'Midterm Evaluation: Web Development',
      description: 'Test your knowledge on React, Next.js, and Node.js',
      instructions: 'Do not switch tabs. Ensure you are in a quiet environment.',
      duration: 60,
      totalMarks: 30,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24), // Started yesterday
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // Ends in 7 days
      passingMarks: 15,
      trainerId: trainer.id
    }
  });

  console.log('Exam created.');

  // 3. Create Questions
  await prisma.question.create({
    data: {
      examId: exam.id,
      text: 'What does React use to increase performance?',
      type: 'MCQ',
      marks: 10,
      options: JSON.stringify(['Virtual DOM', 'Real DOM', 'Shadow DOM', 'Both A and B']),
      correctAnswer: 'Virtual DOM'
    }
  });

  await prisma.question.create({
    data: {
      examId: exam.id,
      text: 'Next.js supports Server-Side Rendering.',
      type: 'TRUE_FALSE',
      marks: 5,
      correctAnswer: 'True'
    }
  });

  await prisma.question.create({
    data: {
      examId: exam.id,
      text: 'Explain the difference between SQL and NoSQL databases.',
      type: 'ESSAY',
      marks: 15,
      correctAnswer: 'SQL databases are relational, NoSQL are non-relational.'
    }
  });

  console.log('Questions created.');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
