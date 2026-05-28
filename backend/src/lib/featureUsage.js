const prisma = require('./prisma');

const logFeatureUsage = async (userId, feature, metadata = null) => {
  try {
    await prisma.featureUsage.create({
      data: {
        userId,
        feature,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (err) {
    console.error('Failed to log feature usage:', err.message);
  }
};

module.exports = { logFeatureUsage };
