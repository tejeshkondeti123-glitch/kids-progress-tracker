// client/src/services/api.js
const API_BASE = '/api';

async function handleResponse(res) {
  if (!res.ok) {
    let errorMsg = 'An unexpected error occurred';
    try {
      const data = await res.json();
      if (data && data.error) {
        errorMsg = data.error;
      }
    } catch {
      errorMsg = res.statusText || errorMsg;
    }
    const err = new Error(errorMsg);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function fetchChildren() {
  const res = await fetch(`${API_BASE}/children`);
  return handleResponse(res);
}

export async function fetchChild(childId = 'child_001') {
  const res = await fetch(`${API_BASE}/children/${childId}`);
  return handleResponse(res);
}

export async function recordLearningActivity(childId = 'child_001', activityData) {
  const res = await fetch(`${API_BASE}/children/${childId}/learning-activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activityData),
  });
  return handleResponse(res);
}

export async function fetchDailySummary(childId = 'child_001', dateStr) {
  const url = dateStr
    ? `${API_BASE}/children/${childId}/daily-summary?date=${encodeURIComponent(dateStr)}`
    : `${API_BASE}/children/${childId}/daily-summary`;
  const res = await fetch(url);
  return handleResponse(res);
}

export async function fetchPracticeOpportunity(childId = 'child_001', dateStr) {
  const url = dateStr
    ? `${API_BASE}/children/${childId}/practice-opportunity?date=${encodeURIComponent(dateStr)}`
    : `${API_BASE}/children/${childId}/practice-opportunity`;
  const res = await fetch(url);
  return handleResponse(res);
}

export async function fetchActivityDetails(activityId) {
  const res = await fetch(`${API_BASE}/activities/${activityId}`);
  return handleResponse(res);
}

export async function saveObservation(childId = 'child_001', { activityId, observation, note }) {
  const res = await fetch(`${API_BASE}/children/${childId}/observations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activityId, observation, note }),
  });
  return handleResponse(res);
}

export async function fetchObservations(childId = 'child_001') {
  const res = await fetch(`${API_BASE}/children/${childId}/observations`);
  return handleResponse(res);
}

export async function resetDemoData() {
  const res = await fetch(`${API_BASE}/demo/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse(res);
}

export async function fetchVersionConfig() {
  const res = await fetch(`${API_BASE}/config/version`);
  return handleResponse(res);
}

export async function setVersionConfig(version) {
  const res = await fetch(`${API_BASE}/config/version`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ version }),
  });
  return handleResponse(res);
}
