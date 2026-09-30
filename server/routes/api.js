// server/routes/api.js
const express = require('express');
const router = express.Router();
const { db, resetDemoData } = require('../db');
const { getDailySummary } = require('../logic/summary');
const { getPracticeOpportunity } = require('../logic/recommendation');

// GET /api/children (List all children)
router.get('/children', (req, res) => {
  try {
    const children = db
      .prepare(`SELECT id, name, age, avatar, createdAt FROM children ORDER BY id ASC`)
      .all();
    res.json(children);
  } catch (err) {
    console.error('Error fetching children:', err);
    res.status(500).json({ error: 'Failed to fetch children' });
  }
});

// GET /api/children/:childId
router.get('/children/:childId', (req, res) => {
  try {
    const { childId } = req.params;
    const child = db
      .prepare(`SELECT id, name, age, avatar, createdAt FROM children WHERE id = ?`)
      .get(childId);

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    res.json(child);
  } catch (err) {
    console.error('Error fetching child:', err);
    res.status(500).json({ error: 'Failed to fetch child details' });
  }
});

// POST /api/children/:childId/learning-activities (Record kids learning session from app)
router.post('/children/:childId/learning-activities', (req, res) => {
  try {
    const { childId } = req.params;
    const { skill, subject, description, status, practiceCount = 1 } = req.body;

    if (!skill || !subject) {
      return res.status(400).json({ error: 'skill and subject are required' });
    }

    const child = db.prepare(`SELECT id FROM children WHERE id = ?`).get(childId);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();

    // Check if an activity for this child, skill, and today already exists
    const existing = db
      .prepare(
        `SELECT id, practiceCount, status FROM learning_activities
         WHERE childId = ? AND skill = ? AND completedAt LIKE ?
         ORDER BY completedAt DESC LIMIT 1`
      )
      .get(childId, skill, `${today}%`);

    let activityRecord;

    if (existing) {
      const newCount = existing.practiceCount + (practiceCount || 1);
      const newStatus = status || existing.status;
      const newDesc = description || undefined;

      db.prepare(
        `UPDATE learning_activities
         SET practiceCount = ?,
             status = ?,
             completedAt = ?,
             description = COALESCE(?, description)
         WHERE id = ?`
      ).run(newCount, newStatus, now, newDesc, existing.id);

      activityRecord = db
        .prepare(`SELECT * FROM learning_activities WHERE id = ?`)
        .get(existing.id);
    } else {
      const newId = `activity_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      db.prepare(
        `INSERT INTO learning_activities (id, childId, skill, subject, description, completedAt, status, practiceCount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        newId,
        childId,
        skill,
        subject,
        description || `Practiced ${skill} in Khan Academy Kids.`,
        now,
        status || 'practiced',
        practiceCount || 1
      );

      activityRecord = db
        .prepare(`SELECT * FROM learning_activities WHERE id = ?`)
        .get(newId);
    }

    const updatedSummary = getDailySummary(childId, today);

    res.status(201).json({
      success: true,
      message: 'Learning activity recorded successfully.',
      activity: activityRecord,
      summary: updatedSummary,
    });
  } catch (err) {
    console.error('Error recording learning activity:', err);
    res.status(500).json({ error: 'Failed to record learning activity' });
  }
});

// GET /api/children/:childId/daily-summary
router.get('/children/:childId/daily-summary', (req, res) => {
  try {
    const { childId } = req.params;
    const date = req.query.date; // optional date override

    const summary = getDailySummary(childId, date);
    if (!summary) {
      return res.status(404).json({ error: 'Child not found' });
    }

    res.json(summary);
  } catch (err) {
    console.error('Error fetching daily summary:', err);
    res.status(500).json({ error: 'Failed to generate daily summary' });
  }
});

// GET /api/children/:childId/practice-opportunity
router.get('/children/:childId/practice-opportunity', (req, res) => {
  try {
    const { childId } = req.params;
    const date = req.query.date || new Date().toISOString().slice(0, 10);

    const child = db.prepare(`SELECT id FROM children WHERE id = ?`).get(childId);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const rows = db
      .prepare(
        `SELECT id, childId, skill, subject, description, completedAt, status, practiceCount
         FROM learning_activities
         WHERE childId = ? AND completedAt LIKE ?
         ORDER BY completedAt DESC`
      )
      .all(childId, `${date}%`);

    const opportunity = getPracticeOpportunity(rows);
    res.json({
      childId,
      date,
      practiceOpportunity: opportunity,
    });
  } catch (err) {
    console.error('Error fetching practice opportunity:', err);
    res.status(500).json({ error: 'Failed to fetch practice opportunity' });
  }
});

// GET /api/activities/:activityId
router.get('/activities/:activityId', (req, res) => {
  try {
    const { activityId } = req.params;
    const row = db
      .prepare(`SELECT * FROM real_world_activities WHERE id = ?`)
      .get(activityId);

    if (!row) {
      return res.status(404).json({ error: 'Real world activity not found' });
    }

    const activity = {
      id: row.id,
      skill: row.skill,
      title: row.title,
      description: row.description,
      instructions: JSON.parse(row.instructions),
      duration: row.duration,
      reason: row.reason,
    };

    res.json(activity);
  } catch (err) {
    console.error('Error fetching activity details:', err);
    res.status(500).json({ error: 'Failed to fetch activity details' });
  }
});

// POST /api/children/:childId/observations
router.post('/children/:childId/observations', (req, res) => {
  try {
    const { childId } = req.params;
    const { activityId, observation, note } = req.body;

    // Validation
    if (!activityId) {
      return res.status(400).json({ error: 'activityId is required' });
    }

    const validObservations = ['independent', 'needed_help', 'difficult'];
    if (!observation || !validObservations.includes(observation)) {
      return res.status(400).json({
        error: `observation must be one of: ${validObservations.join(', ')}`,
      });
    }

    // Check child exists
    const child = db.prepare(`SELECT id FROM children WHERE id = ?`).get(childId);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Check activity exists
    const act = db
      .prepare(`SELECT id FROM real_world_activities WHERE id = ?`)
      .get(activityId);
    if (!act) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const obsId = `obs_${Date.now()}`;
    const createdAt = new Date().toISOString();

    db.prepare(
      `INSERT INTO parent_observations (id, childId, activityId, observation, note, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(obsId, childId, activityId, observation, (note || '').trim(), createdAt);

    const savedObservation = {
      id: obsId,
      childId,
      activityId,
      observation,
      note: (note || '').trim(),
      createdAt,
    };

    res.status(201).json({
      message: 'Observation saved.',
      observation: savedObservation,
    });
  } catch (err) {
    console.error('Error saving observation:', err);
    res.status(500).json({ error: 'Failed to save observation' });
  }
});

// GET /api/children/:childId/observations
router.get('/children/:childId/observations', (req, res) => {
  try {
    const { childId } = req.params;
    const child = db.prepare(`SELECT id FROM children WHERE id = ?`).get(childId);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const rows = db
      .prepare(
        `SELECT o.id, o.childId, o.activityId, o.observation, o.note, o.createdAt,
                a.title as activityTitle, a.skill as activitySkill
         FROM parent_observations o
         LEFT JOIN real_world_activities a ON o.activityId = a.id
         WHERE o.childId = ?
         ORDER BY o.createdAt DESC`
      )
      .all(childId);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching observations:', err);
    res.status(500).json({ error: 'Failed to fetch observations' });
  }
});

// POST /api/demo/reset
router.post('/demo/reset', (req, res) => {
  try {
    const result = resetDemoData();
    res.json(result);
  } catch (err) {
    console.error('Error resetting demo data:', err);
    res.status(500).json({ error: 'Failed to reset demo data' });
  }
});

// GET /api/config/version
router.get('/config/version', (req, res) => {
  try {
    const row = db
      .prepare(`SELECT value FROM prototype_config WHERE key = 'PROTOTYPE_VERSION'`)
      .get();
    res.json({ version: row ? row.value : 'V1' });
  } catch (err) {
    console.error('Error reading version:', err);
    res.status(500).json({ error: 'Failed to read prototype version' });
  }
});

// POST /api/config/version
router.post('/config/version', (req, res) => {
  try {
    const { version } = req.body;
    if (!['V1', 'V2', 'V3'].includes(version)) {
      return res.status(400).json({ error: 'Version must be V1, V2, or V3' });
    }

    db.prepare(
      `INSERT INTO prototype_config (key, value)
       VALUES ('PROTOTYPE_VERSION', ?)
       ON CONFLICT(key) DO UPDATE SET value = ?`
    ).run(version, version);

    res.json({ success: true, version });
  } catch (err) {
    console.error('Error saving version:', err);
    res.status(500).json({ error: 'Failed to save prototype version' });
  }
});

module.exports = router;
