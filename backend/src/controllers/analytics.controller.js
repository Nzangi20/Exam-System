const prisma = require('../lib/prisma');

const INACTIVE_DAYS = 30;

const getUsageAnalysis = async (req, res) => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - INACTIVE_DAYS);

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
      orderBy: { lastLoginAt: 'desc' },
    });

    const active = users.filter((u) => u.lastLoginAt && u.lastLoginAt >= cutoff);
    const inactive = users.filter((u) => !u.lastLoginAt || u.lastLoginAt < cutoff);
    const neverLoggedIn = users.filter((u) => !u.lastLoginAt);

    const byRole = ['STUDENT', 'TRAINER', 'SUPER_ADMIN'].map((role) => ({
      role,
      active: active.filter((u) => u.role === role).length,
      inactive: inactive.filter((u) => u.role === role).length,
    }));

    res.json({
      summary: {
        total: users.length,
        active: active.length,
        inactive: inactive.length,
        neverLoggedIn: neverLoggedIn.length,
        inactiveDaysThreshold: INACTIVE_DAYS,
      },
      byRole,
      activeUsers: active,
      inactiveUsers: inactive,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch usage analysis', details: error.message });
  }
};

const getFeatureUsage = async (req, res) => {
  try {
    const usages = await prisma.featureUsage.groupBy({
      by: ['feature'],
      _count: { feature: true },
      orderBy: { _count: { feature: 'desc' } },
    });

    const recent = await prisma.featureUsage.findMany({
      take: 50,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { name: true, email: true, role: true } } },
    });

    const total = usages.reduce((sum, u) => sum + u._count.feature, 0);

    res.json({
      features: usages.map((u) => ({
        feature: u.feature,
        count: u._count.feature,
        percentage: total ? Math.round((u._count.feature / total) * 100) : 0,
      })),
      totalEvents: total,
      recentActivity: recent,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feature usage', details: error.message });
  }
};

const getInferenceData = async (req, res) => {
  try {
    const [results, activityLogs, ungradedAnswers, exams, users] = await Promise.all([
      prisma.result.findMany({
        include: { exam: { select: { title: true, category: true, level: true } } },
      }),
      prisma.activityLog.findMany({
        include: {
          student: { select: { name: true, email: true } },
          exam: { select: { title: true } },
        },
        orderBy: { timestamp: 'desc' },
        take: 100,
      }),
      prisma.answer.count({ where: { marksAwarded: null, textAnswer: { not: null } } }),
      prisma.exam.count(),
      prisma.user.count({ where: { deletedAt: null } }),
    ]);

    const passCount = results.filter((r) => r.status === 'PASS').length;
    const failCount = results.filter((r) => r.status === 'FAIL').length;
    const pendingCount = results.filter((r) => r.status === 'PENDING').length;
    const graded = passCount + failCount;
    const passRate = graded ? Math.round((passCount / graded) * 100) : 0;

    const cheatingByType = activityLogs.reduce((acc, log) => {
      acc[log.eventType] = (acc[log.eventType] || 0) + 1;
      return acc;
    }, {});

    const categoryPerformance = {};
    results.forEach((r) => {
      const key = `${r.exam.category}-${r.exam.level}`;
      if (!categoryPerformance[key]) {
        categoryPerformance[key] = { pass: 0, fail: 0, pending: 0 };
      }
      if (r.status === 'PASS') categoryPerformance[key].pass++;
      else if (r.status === 'FAIL') categoryPerformance[key].fail++;
      else categoryPerformance[key].pending++;
    });

    res.json({
      overview: {
        totalUsers: users,
        totalExams: exams,
        totalSubmissions: results.length,
        passRate,
        pendingGrading: pendingCount,
        ungradedEssayAnswers: ungradedAnswers,
      },
      resultsBreakdown: { pass: passCount, fail: failCount, pending: pendingCount },
      cheatingEvents: cheatingByType,
      categoryPerformance,
      recentSuspiciousActivity: activityLogs.slice(0, 20),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inference data', details: error.message });
  }
};

const getWorkloadAnalysis = async (req, res) => {
  try {
    const trainers = await prisma.user.findMany({
      where: { role: 'TRAINER', deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        examsCreated: {
          select: {
            id: true,
            title: true,
            results: { select: { id: true, status: true } },
            questions: { select: { id: true } },
          },
        },
      },
    });

    const workload = await Promise.all(
      trainers.map(async (trainer) => {
        const examIds = trainer.examsCreated.map((e) => e.id);
        const pendingResults = trainer.examsCreated.reduce(
          (sum, e) => sum + e.results.filter((r) => r.status === 'PENDING').length,
          0
        );
        const ungradedAnswers = examIds.length
          ? await prisma.answer.count({
              where: {
                examId: { in: examIds },
                marksAwarded: null,
                OR: [{ textAnswer: { not: null } }, { fileUrl: { not: null } }],
              },
            })
          : 0;

        return {
          trainerId: trainer.id,
          name: trainer.name,
          email: trainer.email,
          examCount: trainer.examsCreated.length,
          questionCount: trainer.examsCreated.reduce((s, e) => s + e.questions.length, 0),
          totalSubmissions: trainer.examsCreated.reduce((s, e) => s + e.results.length, 0),
          pendingGrading: pendingResults,
          ungradedAnswers,
          workloadScore: pendingResults * 2 + ungradedAnswers + trainer.examsCreated.length,
        };
      })
    );

    workload.sort((a, b) => b.workloadScore - a.workloadScore);

    res.json({
      summary: {
        totalTrainers: workload.length,
        totalPendingGrading: workload.reduce((s, t) => s + t.pendingGrading, 0),
        totalUngradedAnswers: workload.reduce((s, t) => s + t.ungradedAnswers, 0),
      },
      trainers: workload,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workload analysis', details: error.message });
  }
};

const getArchive = async (req, res) => {
  try {
    const records = await prisma.archiveRecord.findMany({
      where: { restoredAt: null },
      orderBy: { deletedAt: 'desc' },
    });
    res.json(records.map((r) => ({
      ...r,
      data: JSON.parse(r.data),
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch archive', details: error.message });
  }
};

const restoreArchive = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await prisma.archiveRecord.findUnique({ where: { id } });
    if (!record) return res.status(404).json({ error: 'Archive record not found' });
    if (record.restoredAt) return res.status(400).json({ error: 'Already restored' });

    if (record.entityType === 'USER') {
      await prisma.user.update({
        where: { id: record.entityId },
        data: { deletedAt: null },
      });
    }

    await prisma.archiveRecord.update({
      where: { id },
      data: { restoredAt: new Date() },
    });

    res.json({ message: 'Record restored successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to restore archive', details: error.message });
  }
};

const permanentlyDeleteArchive = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await prisma.archiveRecord.findUnique({ where: { id } });
    if (!record) return res.status(404).json({ error: 'Archive record not found' });

    if (record.entityType === 'USER') {
      await prisma.user.delete({ where: { id: record.entityId } });
    }

    await prisma.archiveRecord.delete({ where: { id } });
    res.json({ message: 'Permanently deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to permanently delete', details: error.message });
  }
};

module.exports = {
  getUsageAnalysis,
  getFeatureUsage,
  getInferenceData,
  getWorkloadAnalysis,
  getArchive,
  restoreArchive,
  permanentlyDeleteArchive,
};
