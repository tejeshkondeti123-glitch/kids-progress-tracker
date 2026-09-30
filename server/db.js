// server/db.js
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { getInitialSeedData } = require('./seedData');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'prototype.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS children (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      avatar TEXT NOT NULL DEFAULT 'default',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS learning_activities (
      id TEXT PRIMARY KEY,
      childId TEXT NOT NULL,
      skill TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      completedAt TEXT NOT NULL,
      status TEXT NOT NULL,
      practiceCount INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS real_world_activities (
      id TEXT PRIMARY KEY,
      skill TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      instructions TEXT NOT NULL, -- Stored as JSON string
      duration TEXT NOT NULL,
      reason TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS parent_observations (
      id TEXT PRIMARY KEY,
      childId TEXT NOT NULL,
      activityId TEXT NOT NULL,
      observation TEXT NOT NULL,
      note TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE,
      FOREIGN KEY (activityId) REFERENCES real_world_activities(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS prototype_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

function resetDemoData() {
  const seed = getInitialSeedData();

  const resetTransaction = db.transaction(() => {
    db.prepare(`DELETE FROM parent_observations`).run();
    db.prepare(`DELETE FROM learning_activities`).run();
    db.prepare(`DELETE FROM real_world_activities`).run();
    db.prepare(`DELETE FROM children`).run();

    // Insert Children
    const insertChild = db.prepare(`
      INSERT INTO children (id, name, age, avatar, createdAt)
      VALUES (@id, @name, @age, @avatar, @createdAt)
    `);
    for (const child of seed.children) {
      insertChild.run(child);
    }

    // Insert Learning Activities
    const insertLearning = db.prepare(`
      INSERT INTO learning_activities (id, childId, skill, subject, description, completedAt, status, practiceCount)
      VALUES (@id, @childId, @skill, @subject, @description, @completedAt, @status, @practiceCount)
    `);
    for (const act of seed.learningActivities) {
      insertLearning.run(act);
    }

    // Insert Real World Activities
    const insertReal = db.prepare(`
      INSERT INTO real_world_activities (id, skill, title, description, instructions, duration, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const act of seed.realWorldActivities) {
      insertReal.run(
        act.id,
        act.skill,
        act.title,
        act.description,
        JSON.stringify(act.instructions),
        act.duration,
        act.reason
      );
    }

    // Insert Parent Observations
    const insertObs = db.prepare(`
      INSERT INTO parent_observations (id, childId, activityId, observation, note, createdAt)
      VALUES (@id, @childId, @activityId, @observation, @note, @createdAt)
    `);
    for (const obs of seed.parentObservations) {
      insertObs.run(obs);
    }

    // Set default prototype version
    db.prepare(`
      INSERT INTO prototype_config (key, value)
      VALUES ('PROTOTYPE_VERSION', 'V1')
      ON CONFLICT(key) DO UPDATE SET value = 'V1'
    `).run();
  });

  resetTransaction();
  return { success: true, message: 'Demo data reset successfully.' };
}

// Initialize tables
initSchema();

// If database is empty, seed it
const childCount = db.prepare(`SELECT count(*) as count FROM children`).get().count;
if (childCount === 0) {
  resetDemoData();
}

module.exports = {
  db,
  resetDemoData,
};
