// server/db.js
const fs = require('fs');
const path = require('path');
const { getInitialSeedData } = require('./seedData');

const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel ? '/tmp' : path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.warn('Could not create DATA_DIR, will use in-memory:', e.message);
  }
}

let db;
let useInMemory = false;

try {
  const Database = require('better-sqlite3');
  const DB_PATH = path.join(DATA_DIR, 'prototype.db');
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
} catch (err) {
  console.warn('better-sqlite3 unavailable in this environment, using in-memory mock store:', err.message);
  useInMemory = true;
}

// In-Memory SQLite API compatibility layer if native binary is unavailable
if (useInMemory) {
  let memoryData = {
    children: [],
    learning_activities: [],
    real_world_activities: [],
    parent_observations: [],
    prototype_config: [{ key: 'PROTOTYPE_VERSION', value: 'V1' }],
  };

  db = {
    exec: () => {},
    pragma: () => {},
    transaction: (fn) => fn,
    prepare: (query) => {
      const q = query.trim();
      return {
        run: (...args) => {
          if (q.includes('INSERT INTO parent_observations')) {
            const [id, childId, activityId, observation, note, createdAt] = args;
            memoryData.parent_observations.unshift({ id, childId, activityId, observation, note, createdAt });
          } else if (q.includes('INSERT INTO prototype_config')) {
            const [v] = args;
            const existing = memoryData.prototype_config.find((c) => c.key === 'PROTOTYPE_VERSION');
            if (existing) existing.value = v;
            else memoryData.prototype_config.push({ key: 'PROTOTYPE_VERSION', value: v });
          }
          return { changes: 1 };
        },
        get: (...args) => {
          if (q.includes('SELECT * FROM children WHERE id =') || q.includes('SELECT id, name, age')) {
            return memoryData.children.find((c) => c.id === args[0]);
          }
          if (q.includes('SELECT * FROM real_world_activities WHERE id =')) {
            return memoryData.real_world_activities.find((a) => a.id === args[0]);
          }
          if (q.includes('SELECT * FROM real_world_activities WHERE skill =')) {
            return memoryData.real_world_activities.find((a) => a.skill === args[0]);
          }
          if (q.includes('SELECT value FROM prototype_config')) {
            return memoryData.prototype_config.find((c) => c.key === 'PROTOTYPE_VERSION');
          }
          if (q.includes('SELECT count(*) as count FROM children')) {
            return { count: memoryData.children.length };
          }
          if (q.includes('SELECT count(*) as count FROM learning_activities')) {
            const count = memoryData.learning_activities.filter(
              (a) => a.childId === args[0] && a.completedAt.startsWith(args[1].replace('%', ''))
            ).length;
            return { count };
          }
          return null;
        },
        all: (...args) => {
          if (q.includes('FROM learning_activities')) {
            const prefix = (args[1] || '').replace('%', '');
            return memoryData.learning_activities.filter(
              (a) => a.childId === args[0] && a.completedAt.startsWith(prefix)
            );
          }
          if (q.includes('FROM parent_observations')) {
            return memoryData.parent_observations
              .filter((o) => o.childId === args[0])
              .map((o) => {
                const act = memoryData.real_world_activities.find((a) => a.id === o.activityId);
                return { ...o, activityTitle: act ? act.title : '', activitySkill: act ? act.skill : '' };
              });
          }
          return [];
        },
      };
    },
  };
}

function initSchema() {
  if (useInMemory) return;
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
      instructions TEXT NOT NULL,
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

  if (useInMemory) {
    db.prepare('RESET_IN_MEMORY').run();
    return { success: true, message: 'Demo data reset successfully.' };
  }

  const resetTransaction = db.transaction(() => {
    db.prepare(`DELETE FROM parent_observations`).run();
    db.prepare(`DELETE FROM learning_activities`).run();
    db.prepare(`DELETE FROM real_world_activities`).run();
    db.prepare(`DELETE FROM children`).run();

    const insertChild = db.prepare(`
      INSERT INTO children (id, name, age, avatar, createdAt)
      VALUES (@id, @name, @age, @avatar, @createdAt)
    `);
    for (const child of seed.children) {
      insertChild.run(child);
    }

    const insertLearning = db.prepare(`
      INSERT INTO learning_activities (id, childId, skill, subject, description, completedAt, status, practiceCount)
      VALUES (@id, @childId, @skill, @subject, @description, @completedAt, @status, @practiceCount)
    `);
    for (const act of seed.learningActivities) {
      insertLearning.run(act);
    }

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

    const insertObs = db.prepare(`
      INSERT INTO parent_observations (id, childId, activityId, observation, note, createdAt)
      VALUES (@id, @childId, @activityId, @observation, @note, @createdAt)
    `);
    for (const obs of seed.parentObservations) {
      insertObs.run(obs);
    }

    db.prepare(`
      INSERT INTO prototype_config (key, value)
      VALUES ('PROTOTYPE_VERSION', 'V1')
      ON CONFLICT(key) DO UPDATE SET value = 'V1'
    `).run();
  });

  resetTransaction();
  return { success: true, message: 'Demo data reset successfully.' };
}

initSchema();

const childCheck = db.prepare(`SELECT count(*) as count FROM children`).get();
if (!childCheck || childCheck.count === 0) {
  resetDemoData();
}

module.exports = {
  db,
  resetDemoData,
};
