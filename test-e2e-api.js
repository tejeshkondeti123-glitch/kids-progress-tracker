// test-e2e-api.js
const assert = require('assert');

async function testE2E() {
  console.log('🚀 Running Comprehensive End-to-End HTTP API & Integration Verification...\n');
  const baseUrl = 'http://localhost:3001';

  // 1. Health check
  console.log('1. Testing /health...');
  const healthRes = await fetch(`${baseUrl}/health`);
  assert.strictEqual(healthRes.status, 200);
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'ok');
  console.log('   ✅ Health OK:', healthData);

  // 2. Child profile
  console.log('2. Testing GET /api/children/child_001...');
  const childRes = await fetch(`${baseUrl}/api/children/child_001`);
  assert.strictEqual(childRes.status, 200);
  const childData = await childRes.json();
  assert.strictEqual(childData.name, 'Sarah');
  assert.strictEqual(childData.age, 7);
  console.log('   ✅ Child Profile Verified: Sarah, Age 7');

  // 3. Daily summary (Screen 1 data)
  console.log('3. Testing GET /api/children/child_001/daily-summary (Screen 1)...');
  const summaryRes = await fetch(`${baseUrl}/api/children/child_001/daily-summary`);
  assert.strictEqual(summaryRes.status, 200);
  const summaryData = await summaryRes.json();
  assert.strictEqual(summaryData.child.name, 'Sarah');
  assert.ok(summaryData.activities.length >= 3, 'Must have at least 3 learning activities');
  assert.ok(summaryData.practiceOpportunity, 'Must have a practice opportunity');
  assert.strictEqual(summaryData.practiceOpportunity.skill, 'Counting 1-10');
  console.log(`   ✅ Daily summary loaded with ${summaryData.activities.length} activities.`);
  console.log(`   ✅ Practice Opportunity: "${summaryData.practiceOpportunity.skill}" (Activity ID: ${summaryData.practiceOpportunity.activityId})`);

  // 4. Empty state testing (Scenario 2)
  console.log('4. Testing GET /api/children/child_001/daily-summary?date=2020-01-01 (Empty Scenario)...');
  const emptyRes = await fetch(`${baseUrl}/api/children/child_001/daily-summary?date=2020-01-01`);
  assert.strictEqual(emptyRes.status, 200);
  const emptyData = await emptyRes.json();
  assert.strictEqual(emptyData.activities.length, 0);
  assert.strictEqual(emptyData.practiceOpportunity, null);
  console.log('   ✅ Empty state returned 0 activities and null practice opportunity.');

  // 5. Activity details (Screen 2 data)
  console.log('5. Testing GET /api/activities/real_001 (Screen 2)...');
  const actRes = await fetch(`${baseUrl}/api/activities/real_001`);
  assert.strictEqual(actRes.status, 200);
  const actData = await actRes.json();
  assert.strictEqual(actData.title, 'Count 5 Objects');
  assert.strictEqual(actData.duration, '5 minutes');
  assert.strictEqual(actData.instructions.length, 5);
  console.log(`   ✅ Activity details loaded: "${actData.title}" (${actData.duration}), ${actData.instructions.length} steps.`);

  // 6. Post observation (Screen 2 interaction)
  console.log('6. Testing POST /api/children/child_001/observations (Observation submission)...');
  const obsPayload = {
    activityId: 'real_001',
    observation: 'needed_help',
    note: 'Sarah counted to 5 easily, needed help on 6.',
  };
  const postObsRes = await fetch(`${baseUrl}/api/children/child_001/observations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obsPayload),
  });
  assert.strictEqual(postObsRes.status, 201);
  const postObsData = await postObsRes.json();
  assert.strictEqual(postObsData.message, 'Observation saved.');
  assert.strictEqual(postObsData.observation.observation, 'needed_help');
  console.log('   ✅ Observation saved successfully:', postObsData.message);

  // 7. Get previous observations
  console.log('7. Testing GET /api/children/child_001/observations...');
  const getObsRes = await fetch(`${baseUrl}/api/children/child_001/observations`);
  assert.strictEqual(getObsRes.status, 200);
  const observations = await getObsRes.json();
  assert.ok(observations.length >= 2, 'Should have initial seed observation plus newly added');
  const latestObs = observations[0];
  assert.strictEqual(latestObs.activityId, 'real_001');
  console.log(`   ✅ Fetched ${observations.length} observations. Latest: "${latestObs.observation}" - "${latestObs.note}"`);

  // 8. Version switching (V1 -> V2 -> V3)
  console.log('8. Testing Version Switching via API (/api/config/version)...');
  for (const ver of ['V1', 'V2', 'V3']) {
    const vRes = await fetch(`${baseUrl}/api/config/version`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: ver }),
    });
    assert.strictEqual(vRes.status, 200);
    const getVRes = await fetch(`${baseUrl}/api/config/version`);
    const getVData = await getVRes.json();
    assert.strictEqual(getVData.version, ver);
    console.log(`   ✅ Version switched to ${ver} successfully.`);
  }

  // 9. Demo reset endpoint
  console.log('9. Testing POST /api/demo/reset...');
  const resetRes = await fetch(`${baseUrl}/api/demo/reset`, { method: 'POST' });
  assert.strictEqual(resetRes.status, 200);
  const resetData = await resetRes.json();
  assert.strictEqual(resetData.success, true);
  // 10. Frontend delivery test
  console.log('10. Testing GET / (Frontend delivery)...');
  const feRes = await fetch(`${baseUrl}/`);
  assert.strictEqual(feRes.status, 200);
  const feHtml = await feRes.text();
  assert.ok(feHtml.includes('<!DOCTYPE html>'));
  assert.ok(feHtml.includes('Parent Companion'));
  console.log('   ✅ Frontend application index.html successfully served.');

  // 11. List all learners
  console.log('11. Testing GET /api/children (List children)...');
  const allKidsRes = await fetch(`${baseUrl}/api/children`);
  assert.strictEqual(allKidsRes.status, 200);
  const allKidsData = await allKidsRes.json();
  assert.ok(Array.isArray(allKidsData) && allKidsData.length >= 3);
  console.log(`   ✅ Children list verified (${allKidsData.length} children found).`);

  // 12. Kids App Live Game Session Recording
  console.log('12. Testing POST /api/children/child_001/learning-activities (Kids App gameplay sync)...');
  const gamePayload = {
    skill: 'Counting 1-10',
    subject: 'Math',
    description: 'Practiced counting strawberries with Kodi in Khan Academy Kids app.',
    status: 'needs_more_practice',
    practiceCount: 1,
  };
  const gameRes = await fetch(`${baseUrl}/api/children/child_001/learning-activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gamePayload),
  });
  assert.strictEqual(gameRes.status, 201);
  const gameData = await gameRes.json();
  assert.strictEqual(gameData.success, true);
  assert.strictEqual(gameData.activity.skill, 'Counting 1-10');
  assert.ok(gameData.summary.activities.length >= 3);
  console.log('   ✅ Kids learning activity successfully synced with Parent Dashboard in real-time!');

  console.log('\n🌟 ALL 12 END-TO-END HTTP INTEGRATION TESTS PASSED PERFECTLY! 🌟\n');
}

testE2E().catch((err) => {
  console.error('❌ E2E verification failed:', err);
  process.exit(1);
});
