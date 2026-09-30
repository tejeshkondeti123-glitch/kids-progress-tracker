// test-api.js
// Automated verification script for the prototype's backend and logic
const assert = require('assert');
const { getDailySummary } = require('./server/logic/summary');
const { getPracticeOpportunity } = require('./server/logic/recommendation');
const { resetDemoData, db } = require('./server/db');

async function runTests() {
  console.log('🧪 Starting automated backend and database tests...\n');

  // 1. Reset demo data to ensure clean initial state
  console.log('Test 1: Reset demo data...');
  const resetRes = resetDemoData();
  assert.strictEqual(resetRes.success, true);
  console.log('✅ Demo data reset successfully.');

  // 2. Query child
  console.log('\nTest 2: Query child_001 (Sarah)...');
  const child = db.prepare('SELECT * FROM children WHERE id = ?').get('child_001');
  assert.ok(child, 'Child should exist');
  assert.strictEqual(child.name, 'Sarah');
  assert.strictEqual(child.age, 7);
  console.log(`✅ Child verified: ${child.name}, Age ${child.age}`);

  // 3. Daily Summary logic
  console.log('\nTest 3: getDailySummary for Sarah on today...');
  const today = new Date().toISOString().slice(0, 10);
  const summary = getDailySummary('child_001', today);
  assert.ok(summary, 'Summary should exist');
  assert.strictEqual(summary.child.name, 'Sarah');
  assert.strictEqual(summary.activities.length, 3, 'Should have 3 activities for today');
  console.log(`✅ Found ${summary.activities.length} learning activities for today:`);
  summary.activities.forEach((act) => {
    console.log(`   - ${act.skill} (${act.subject}): status="${act.status}", count=${act.practiceCount}`);
  });

  // 4. Recommendation logic verification
  console.log('\nTest 4: Verify rule-based recommendation logic...');
  assert.ok(summary.practiceOpportunity, 'Should produce a practice opportunity');
  assert.strictEqual(
    summary.practiceOpportunity.skill,
    'Counting 1-10',
    'Should prioritize skill with needs_more_practice'
  );
  assert.strictEqual(summary.practiceOpportunity.activityId, 'real_001');
  console.log(`✅ Recommended skill correctly identified: "${summary.practiceOpportunity.skill}"`);
  console.log(`   Reason: "${summary.practiceOpportunity.reason}"`);

  // Verify neutral phrasing: should NOT claim mastery
  assert.ok(
    !summary.practiceOpportunity.reason.toLowerCase().includes('mastered'),
    'Reason must not falsely claim mastery'
  );
  console.log('✅ Neutral wording confirmed: no false mastery claims.');

  // 5. Query Real World Activity
  console.log('\nTest 5: Query real-world activity real_001 ("Count 5 Objects")...');
  const act = db.prepare('SELECT * FROM real_world_activities WHERE id = ?').get('real_001');
  assert.ok(act);
  assert.strictEqual(act.title, 'Count 5 Objects');
  assert.strictEqual(act.duration, '5 minutes');
  const instructions = JSON.parse(act.instructions);
  assert.strictEqual(instructions.length, 5, 'Should have 5 instruction steps');
  console.log(`✅ Real-world activity verified: "${act.title}" (${act.duration}), ${instructions.length} steps.`);

  // 6. Test Observation Creation and Storage
  console.log('\nTest 6: Parent Observation recording and persistence...');
  const initialObsCount = db.prepare('SELECT count(*) as count FROM parent_observations WHERE childId = ?').get('child_001').count;
  
  const testObsId = `obs_test_${Date.now()}`;
  db.prepare(`
    INSERT INTO parent_observations (id, childId, activityId, observation, note, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(testObsId, 'child_001', 'real_001', 'independent', 'Counted all 5 spoons with excitement!', new Date().toISOString());

  const newObsCount = db.prepare('SELECT count(*) as count FROM parent_observations WHERE childId = ?').get('child_001').count;
  assert.strictEqual(newObsCount, initialObsCount + 1, 'Observation count should increment by 1');

  const savedObs = db.prepare('SELECT * FROM parent_observations WHERE id = ?').get(testObsId);
  assert.strictEqual(savedObs.observation, 'independent');
  assert.strictEqual(savedObs.note, 'Counted all 5 spoons with excitement!');
  console.log(`✅ Observation stored: status="${savedObs.observation}", note="${savedObs.note}"`);

  // 7. Test Empty State Handling
  console.log('\nTest 7: Empty state handling for past/future date with 0 activities...');
  const emptySummary = getDailySummary('child_001', '2020-01-01');
  assert.strictEqual(emptySummary.activities.length, 0, 'Should have 0 activities');
  assert.strictEqual(emptySummary.practiceOpportunity, null, 'Should have null practice opportunity');
  console.log('✅ Empty summary correctly handled with 0 activities and null practice opportunity.');

  // 8. Test Recommendation fallback when no "needs_more_practice" exists
  console.log('\nTest 8: Recommendation logic when all activities are "practiced"...');
  const allPracticed = [
    { skill: 'Shapes', subject: 'Math', description: 'Test', status: 'practiced', practiceCount: 2 },
  ];
  const recFallback = getPracticeOpportunity(allPracticed);
  assert.ok(recFallback);
  assert.strictEqual(recFallback.skill, 'Shapes');
  assert.strictEqual(recFallback.activityId, 'real_002');
  console.log(`✅ Fallback recommendation works: selected recently practiced skill "${recFallback.skill}".`);

  console.log('\n🎉 ALL 8 BACKEND AND LOGIC TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
