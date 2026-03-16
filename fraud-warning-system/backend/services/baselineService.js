const EmployeeProfile = require("../models/EmployeeProfile");

const absDeviation = (value, baseline) => {
  const v = Number(value || 0);
  const b = Number(baseline || 0);
  if (b === 0) return v;
  return Math.abs(v - b);
};

const calculateDeviations = (activity, profile) => {
  const ts = activity.timestamp ? new Date(activity.timestamp) : new Date();
  const loginHour = ts.getHours();

  return {
    loginHourDeviation: absDeviation(loginHour, profile.avgLoginHour),
    accountsAccessDeviation: absDeviation(
      activity.accountsAccessed,
      profile.avgAccountsAccessed,
    ),
    dataVolumeDeviation: absDeviation(
      activity.dataVolume,
      profile.avgDataVolume,
    ),
    transactionDeviation: absDeviation(
      activity.transactionAmount,
      profile.avgTransactionAmount,
    ),
  };
};

const smoothUpdate = (current, next, alpha) => {
  return current * (1 - alpha) + next * alpha;
};

const getOrCreateProfile = async (activity) => {
  let profile = await EmployeeProfile.findOne({
    employeeId: activity.employeeId,
  });
  if (!profile) {
    profile = await EmployeeProfile.create({
      employeeId: activity.employeeId,
      employeeName: activity.employeeName,
      department: activity.department,
      avgLoginHour: (activity.timestamp
        ? new Date(activity.timestamp)
        : new Date()
      ).getHours(),
      avgAccountsAccessed: Number(activity.accountsAccessed || 0),
      avgDataVolume: Number(activity.dataVolume || 0),
      avgTransactionAmount: Number(activity.transactionAmount || 0),
      typicalSessionDuration: Number(activity.sessionDuration || 0),
      activityHistory: 1,
      lastActivityAt: activity.timestamp
        ? new Date(activity.timestamp)
        : new Date(),
    });
  }
  return profile;
};

const updateProfile = async (profile, activity) => {
  const history = Number(profile.activityHistory || 0);
  const alpha = history < 20 ? 0.2 : 0.08;
  const ts = activity.timestamp ? new Date(activity.timestamp) : new Date();
  const loginHour = ts.getHours();

  profile.employeeName = activity.employeeName || profile.employeeName;
  profile.department = activity.department || profile.department;
  profile.avgLoginHour = smoothUpdate(profile.avgLoginHour, loginHour, alpha);
  profile.avgAccountsAccessed = smoothUpdate(
    profile.avgAccountsAccessed,
    Number(activity.accountsAccessed || 0),
    alpha,
  );
  profile.avgDataVolume = smoothUpdate(
    profile.avgDataVolume,
    Number(activity.dataVolume || 0),
    alpha,
  );
  profile.avgTransactionAmount = smoothUpdate(
    profile.avgTransactionAmount,
    Number(activity.transactionAmount || 0),
    alpha,
  );
  profile.typicalSessionDuration = smoothUpdate(
    profile.typicalSessionDuration,
    Number(activity.sessionDuration || 0),
    alpha,
  );
  profile.activityHistory = history + 1;
  profile.lastActivityAt = ts;
  await profile.save();

  return profile;
};

module.exports = {
  getOrCreateProfile,
  calculateDeviations,
  updateProfile,
};
