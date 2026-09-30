// server/logic/recommendation.js
const { db } = require('../db');

/**
 * Generates rule-based practice recommendation without false mastery assumptions.
 *
 * @param {Array} activities - Today's completed learning activities for the child
 * @returns {Object|null} Recommendation object with matching real-world activity
 */
function getPracticeOpportunity(activities) {
  if (!activities || activities.length === 0) {
    return null;
  }

  // 1. Identify activities marked "needs_more_practice"
  const needsMorePractice = activities.find(
    (act) => act.status === 'needs_more_practice'
  );

  let targetActivity = needsMorePractice;
  let reasonText = '';
  let noteText = '';

  if (targetActivity) {
    reasonText = `Your child practiced ${targetActivity.skill.toLowerCase()} today. Try a short real-life activity to reinforce this concept.`;
    noteText = targetActivity.practiceCount > 1
      ? `Practiced ${targetActivity.practiceCount} times today and could benefit from hands-on reinforcement.`
      : 'Identified as a helpful concept to practice together.';
  } else {
    // 2. If none needs more practice, choose the most recently practiced skill
    targetActivity = activities[0];
    reasonText = `Your child recently practiced ${targetActivity.skill.toLowerCase()}. Try a hands-on activity to apply this concept in the real world.`;
    noteText = targetActivity.practiceCount > 1
      ? `Practiced several times today.`
      : 'Practiced today.';
  }

  if (!targetActivity) {
    return null;
  }

  // 3. Find matching real-world activity in the database
  const realWorld = db
    .prepare(`SELECT * FROM real_world_activities WHERE skill = ?`)
    .get(targetActivity.skill);

  // Fallback: If no exact skill match, pick any available real-world activity
  const fallbackRealWorld =
    realWorld ||
    db.prepare(`SELECT * FROM real_world_activities LIMIT 1`).get();

  if (!fallbackRealWorld) {
    return {
      skill: targetActivity.skill,
      activityId: null,
      status: targetActivity.status,
      reason: reasonText,
      note: noteText,
      activity: null,
    };
  }

  return {
    skill: targetActivity.skill,
    activityId: fallbackRealWorld.id,
    status: targetActivity.status,
    reason: reasonText,
    note: noteText,
    activity: {
      id: fallbackRealWorld.id,
      skill: fallbackRealWorld.skill,
      title: fallbackRealWorld.title,
      description: fallbackRealWorld.description,
      duration: fallbackRealWorld.duration,
      instructions: JSON.parse(fallbackRealWorld.instructions),
      reason: fallbackRealWorld.reason,
    },
  };
}

module.exports = {
  getPracticeOpportunity,
};
