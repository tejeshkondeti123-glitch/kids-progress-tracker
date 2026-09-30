// server/logic/summary.js
const { db } = require('../db');
const { getPracticeOpportunity } = require('./recommendation');

/**
 * Generates the daily summary for a child on a given date.
 *
 * @param {string} childId - Child identifier
 * @param {string} [dateStr] - YYYY-MM-DD date string (defaults to today)
 * @returns {Object|null} Daily summary payload or null if child not found
 */
function getDailySummary(childId, dateStr) {
  // Fetch child
  const child = db
    .prepare(`SELECT id, name, age, avatar, createdAt FROM children WHERE id = ?`)
    .get(childId);

  if (!child) {
    return null;
  }

  let targetDate = dateStr;
  if (!targetDate) {
    const today = new Date().toISOString().slice(0, 10);
    const countToday = db
      .prepare(
        `SELECT count(*) as count FROM learning_activities WHERE childId = ? AND completedAt LIKE ?`
      )
      .get(childId, `${today}%`).count;

    if (countToday > 0) {
      targetDate = today;
    } else {
      const latest = db
        .prepare(
          `SELECT substr(completedAt, 1, 10) as dt FROM learning_activities WHERE childId = ? ORDER BY completedAt DESC LIMIT 1`
        )
        .get(childId);
      targetDate = latest ? latest.dt : today;
    }
  }

  // Fetch all activities completed on targetDate (matching completedAt starting with targetDate)
  const rows = db
    .prepare(
      `SELECT id, childId, skill, subject, description, completedAt, status, practiceCount
       FROM learning_activities
       WHERE childId = ? AND completedAt LIKE ?
       ORDER BY completedAt DESC`
    )
    .all(childId, `${targetDate}%`);

  // Group or aggregate by skill if needed, or maintain distinct activities
  // Notice requirement: Group them by skill/subject and return skill, description, status, practice count
  const activities = rows.map((r) => ({
    id: r.id,
    skill: r.skill,
    subject: r.subject,
    description: r.description,
    status: r.status,
    practiceCount: r.practiceCount,
    completedAt: r.completedAt,
  }));

  // Identify practice opportunity
  const practiceOpportunity = getPracticeOpportunity(activities);

  return {
    child: {
      id: child.id,
      name: child.name,
      age: child.age,
      avatar: child.avatar,
    },
    date: targetDate,
    activities,
    practiceOpportunity: practiceOpportunity
      ? {
          skill: practiceOpportunity.skill,
          activityId: practiceOpportunity.activityId,
          status: practiceOpportunity.status,
          reason: practiceOpportunity.reason,
          note: practiceOpportunity.note,
        }
      : null,
  };
}

module.exports = {
  getDailySummary,
};
