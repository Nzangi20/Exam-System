const prisma = require('../lib/prisma');

const getNotifications = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const notifications = [];

    if (role === 'STUDENT') {
      const profile = await prisma.studentProfile.findUnique({ where: { userId } });
      const now = new Date();

      const exams = profile
        ? await prisma.exam.findMany({
            where: {
              category: profile.examCategory,
              level: profile.examLevel,
              endDate: { gte: now },
            },
            orderBy: { startDate: 'asc' },
            take: 5,
          })
        : [];

      exams.forEach((exam) => {
        const started = exam.startDate <= now;
        notifications.push({
          id: `exam-${exam.id}`,
          title: started ? 'Exam available now' : 'Upcoming exam',
          message: `${exam.title} — ${started ? 'You can take this exam now.' : `Starts ${exam.startDate.toLocaleDateString()}`}`,
          type: 'EXAM',
          link: `/student/exams/${exam.id}`,
          createdAt: exam.startDate,
        });
      });

      const recentResources = profile
        ? await prisma.studentResource.findMany({
            where: {
              createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
              OR: [
                { studentId: userId },
                {
                  studentId: null,
                  AND: [
                    { OR: [{ category: null }, { category: profile.examCategory }] },
                    { OR: [{ level: null }, { level: profile.examLevel }] },
                  ],
                },
              ],
            },
            include: { trainer: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 5,
          })
        : [];

      recentResources.forEach((r) => {
        notifications.push({
          id: `resource-${r.id}`,
          title: r.materialType === 'REVISION' ? 'New revision material' : 'New notes uploaded',
          message: `${r.trainer.name} shared "${r.title}"`,
          type: 'MATERIAL',
          link: '/student/materials',
          createdAt: r.createdAt,
        });
      });

      const results = await prisma.result.findMany({
        where: { studentId: userId },
        include: { exam: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      results.forEach((r) => {
        if (r.status === 'PENDING') {
          notifications.push({
            id: `result-pending-${r.id}`,
            title: 'Result pending',
            message: `Your submission for "${r.exam.title}" is awaiting grading.`,
            type: 'RESULT',
            link: '/student/results',
            createdAt: r.createdAt,
          });
        } else {
          notifications.push({
            id: `result-${r.id}`,
            title: r.status === 'PASS' ? 'Exam passed' : 'Exam result',
            message: `"${r.exam.title}" — Score: ${r.score} (${r.status})`,
            type: 'RESULT',
            link: '/student/results',
            createdAt: r.createdAt,
          });
        }
      });
    }

    if (role === 'TRAINER' || role === 'SUPER_ADMIN') {
      const examFilter = role === 'TRAINER' ? { trainerId: userId } : {};
      const exams = await prisma.exam.findMany({
        where: examFilter,
        include: { results: true },
      });

      let pendingTotal = 0;
      exams.forEach((exam) => {
        const pending = exam.results.filter((r) => r.status === 'PENDING').length;
        pendingTotal += pending;
        if (pending > 0) {
          notifications.push({
            id: `grade-${exam.id}`,
            title: 'Submissions to grade',
            message: `${pending} pending submission(s) for "${exam.title}"`,
            type: 'GRADING',
            link: `/trainer/students`,
            createdAt: new Date(),
          });
        }
      });

      if (pendingTotal > 0 && role === 'TRAINER') {
        notifications.unshift({
          id: 'grade-summary',
          title: 'Grading reminder',
          message: `You have ${pendingTotal} total submission(s) awaiting review.`,
          type: 'GRADING',
          link: '/trainer/students',
          createdAt: new Date(),
        });
      }
    }

    if (role === 'SUPER_ADMIN') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);

      const inactiveCount = await prisma.user.count({
        where: {
          deletedAt: null,
          OR: [{ lastLoginAt: null }, { lastLoginAt: { lt: cutoff } }],
        },
      });

      if (inactiveCount > 0) {
        notifications.push({
          id: 'inactive-users',
          title: 'Inactive accounts',
          message: `${inactiveCount} user(s) have not logged in within 30 days.`,
          type: 'SYSTEM',
          link: '/admin/usage',
          createdAt: new Date(),
        });
      }

      const archiveCount = await prisma.archiveRecord.count({ where: { restoredAt: null } });
      if (archiveCount > 0) {
        notifications.push({
          id: 'archive-records',
          title: 'Archived records',
          message: `${archiveCount} record(s) in the archive awaiting review.`,
          type: 'SYSTEM',
          link: '/admin/archive',
          createdAt: new Date(),
        });
      }

      const pendingResults = await prisma.result.count({ where: { status: 'PENDING' } });
      if (pendingResults > 0) {
        notifications.push({
          id: 'system-pending',
          title: 'System-wide pending grading',
          message: `${pendingResults} exam result(s) need grading across all trainers.`,
          type: 'GRADING',
          link: '/admin/workload',
          createdAt: new Date(),
        });
      }
    }

    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ notifications, unreadCount: notifications.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications', details: error.message });
  }
};

module.exports = { getNotifications };
